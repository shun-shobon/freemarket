# frozen_string_literal: true

require 'sinatra'
require 'active_record'
require 'time'
require 'dotenv'
require 'securerandom'
require 'argon2'
require 'mimemagic'
require 'marcel'
require 'digest'

# 本番環境に設定
set :environment, :production
# セッションを有効化
set :sessions,
    expire_after: 60 * 60 * 24 * 7,
    secret: 'de7715df7b826ffca1d9bb0d4af49f79f73bbf1f060b6d3e1fd3398db60dae98'

# データベースの設定
ActiveRecord::Base.configurations = YAML.load_file('database.yml')
ActiveRecord::Base.establish_connection :development
# ログを標準出力に出力
ActiveRecord::Base.logger = Logger.new(STDOUT)

# ユーザー
class User < ActiveRecord::Base
  self.table_name = 'users'

  # 出品した商品を持つ
  has_many :items, foreign_key: :user_id, dependent: :destroy
end

# 出品された商品
class Item < ActiveRecord::Base
  self.table_name = 'items'

  # 出品者を持つ
  belongs_to :user, foreign_key: :user_id
  # 入札を持つ
  has_many :bids, foreign_key: :item_id, dependent: :destroy
end

# 入札
class Bid < ActiveRecord::Base
  self.table_name = 'bids'

  # 出品された商品を持つ
  belongs_to :item, foreign_key: :item_id
  # 入札者を持つ
  belongs_to :user, foreign_key: :user_id
end

helpers do
  # ログインしているかどうかを判定
  def login?
    !@user.nil?
  end

  # ログインしていない場合はログイン画面にリダイレクト
  def enforce_login!
    redirect '/login' unless login?
  end

  # ログインしている場合はホーム画面にリダイレクト
  def enforce_not_login!
    redirect '/' if login?
  end
end

before do
  # ログインしている場合はユーザー情報を取得
  @user ||= User.select(:id, :name, :email, :is_admin).find_by(id: session[:user_id]) if session[:user_id]
end

get '/' do
  erb :index
end

get '/items' do
  page = params[:page].to_i
  page = 1 if page < 1
  # 1ページあたりの表示件数
  per_page = 5
  user_id = params[:user_id]&.to_i

  count = Item.count
  max_page = (count / per_page.to_f).ceil
  page = max_page if page > max_page

  # 出品された商品を取得
  items = Item
          .joins(:user) # 出品者の情報を取得するために結合
          .left_outer_joins(:bids) # 応募者の情報を取得するために左外部結合
          .group(:id) # 応募者の件数を取得するためにグループ化
          .select('items.*, users.name as user_name, count(bids.id) as bid_count') # 応募者の件数を取得するためにcountを使用
          .yield_self { |q| user_id.nil? ? q : q.where(user_id:) } # ユーザーIDが指定されている場合は絞り込む
          .order(created_at: :desc) # 新しい順に並べる
          .offset((page - 1) * per_page) # ページ数に応じてオフセットを設定
          .limit(per_page) # 1ページあたりの表示件数

  res = {
    items:,
    page:,
    max_page:
  }
  body res.to_json
end

get '/items/:id' do
  id = params[:id].to_i

  # 出品された商品を取得
  item = Item
         .joins(:user)
         .select('items.*, users.name as user_name')
         .find_by(id:)
  halt 404 if item.nil?

  # 出品者の場合は応募者の情報も取得
  bids = if item.user_id == @user&.id
           Bid.joins(:user).select('bids.*, users.name as user_name').where(item_id: id).order(created_at: :desc)
         end

  @data = {
    item:,
    bids:
  }
  erb :item
end

get '/my/items' do
  enforce_login!

  erb :my_items
end

post '/bid' do
  enforce_login!

  id = params[:id].to_i
  # 出品された商品を取得
  item = Item.find_by(id:)
  # エラー処理
  halt 404 if item.nil?
  halt 400, '自分の出品した商品には応募できません' if item.user_id == @user.id
  halt 400, '応募期間が終了しています' if !item.deadline.nil? && item.deadline < Time.now
  # 早いもの勝ちの場合はすでに応募があるかどうかを確認
  if item.deadline.nil?
    bid_count = Bid.where(item_id: id).count
    halt 400, 'すでに締め切られています' if bid_count.positive?
  end

  Bid.create!(
    item_id: id,
    user_id: @user.id
  )

  redirect '/'
end

get '/login' do
  enforce_not_login!

  erb :login
end

post '/login' do
  enforce_not_login!

  email = params[:email]
  password = params[:password]

  # バリデーション
  ok, err = validate_login(email, password)
  # バリデーションに失敗したらエラーを表示してログイン画面に戻る
  unless ok
    @err = err
    status 401
    return erb :login
  end

  # メールアドレスからユーザーを取得
  user = User.find_by(email:)
  # ユーザーが存在しないか、パスワードが間違っていたらエラーを表示してログイン画面に戻る
  if user.nil? || !Argon2::Password.verify_password(password, user.hashed_password)
    @err = 'メールアドレスかパスワードが間違っています'
    status 401
    return erb :login
  end

  session[:user_id] = user.id
  redirect '/'
end

# ログインのバリデーション
def validate_login(email, password)
  return [false, 'メールアドレスを入力してください'] if email.nil? || email.empty?
  return [false, 'パスワードを入力してください'] if password.nil? || password.empty?

  [true, nil]
end

post '/logout' do
  session.clear

  redirect '/'
end

get '/register' do
  enforce_not_login!

  erb :register
end

# 新規登録処理
post '/register' do
  enforce_not_login!

  name = params[:name]
  email = params[:email]
  password = params[:password]

  # バリデーション
  ok, err = validate_register(name, email, password)
  # バリデーションに失敗したらエラーを表示して登録画面に戻る
  unless ok
    @err = err
    status 400
    return erb :register
  end

  # メールアドレスが既に登録されているかチェック
  if User.find_by(email:)
    @err = 'そのメールアドレスは既に登録されています'
    status 400
    return erb :register
  end

  # パスワードをハッシュ化
  # Argon2ならソルトは自動生成され、ハッシュ化されたパスワードに含まれる
  hashed_password = Argon2::Password.create(password)

  # ユーザーを登録
  user = User.create!(
    name:,
    email:,
    hashed_password:,
    is_admin: false
  )

  # セッションにユーザーIDを保存
  session[:user_id] = user.id

  # ホーム画面にリダイレクト
  redirect '/'
end

# ユーザー登録のバリデーション
def validate_register(name, email, password)
  return [false, '名前を入力してください'] if name.nil? || name.empty?
  return [false, 'メールアドレスを入力してください'] if email.nil? || email.empty?
  return [false, 'パスワードを入力してください'] if password.nil? || password.empty?

  [true, nil]
end

get '/new' do
  enforce_login!

  erb :new
end

post '/new' do
  enforce_login!

  name = params[:name]
  description = params[:description]
  type = params[:type]
  # 画像をバイナリで取得
  image = params[:image]&.[](:tempfile)&.read
  # 期限をパース
  deadline = begin
    Time.parse(params[:deadline])
  rescue StandardError
    # パースに失敗したらnilを返す
    nil
  end

  # バリデーション
  ok, err = validate_new(name, description, image, type, deadline)
  # バリデーションに失敗したらエラーを表示して新規作成画面に戻る
  unless ok
    @err = err
    status 400
    return erb :new
  end

  # 商品を登録
  item = Item.create!(
    name:,
    description:,
    deadline: deadline&.iso8601,
    user_id: @user.id
  )

  # 画像があれば保存
  if image
    # 画像の拡張子を取得
    ext = MimeMagic.new(Marcel::MimeType.for(image)).extensions[0]
    # 画像のハッシュ値を取得
    hash = Digest::SHA256.hexdigest(image)
    # ファイル名を決定
    filename = "#{item.id}_#{hash}.#{ext}"
    # 画像を保存
    File.open("public/uploads/#{filename}", 'wb') do |f|
      f.write(image)
    end

    # 画像のパスを保存
    item.image = filename
    item.save!
  end

  # 商品のデータをビューに渡す
  @data = item
  # 成功画面を表示
  erb :success
end

# 出品登録のバリデーション
def validate_new(name, description, image, type, deadline)
  return [false, '商品名を入力してください'] if name.nil? || name.empty?
  return [false, '商品説明を入力してください'] if description.nil? || description.empty?
  return [false, '画像を選択してください'] if !image.nil? && !MimeMagic.new(Marcel::MimeType.for(image)).image?
  return [false, '移譲先を選択してください'] unless %w[race lottery].include?(type)
  return [false, '期限を入力してください'] if type == 'lottery' && deadline.nil?
  return [false, '期限は未来を指定してください'] if type == 'lottery' && deadline < Time.now

  [true, nil]
end

# 商品の削除
post '/delete' do
  enforce_login!

  id = params[:id]

  # 商品を削除
  item = Item.find_by(id:)
  # 商品が存在し、ユーザーが管理者または商品の出品者であれば削除
  if @user.is_admin || item&.user_id == @user.id
    File.delete("public/uploads/#{item.image}") if item.image
    item.destroy
  end

  # ホーム画面にリダイレクト
  redirect '/'
end

get '/admin' do
  enforce_login!
  halt 403 unless @user.is_admin

  erb :admin
end
