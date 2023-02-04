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

Dotenv.load

# set :environment, :production
set :sessions,
    expire_after: 60 * 60 * 24 * 7,
    secret: ENV['SESSION_SECRET']

ActiveRecord::Base.configurations = YAML.load_file('database.yml')
ActiveRecord::Base.establish_connection :development

# ユーザー
class User < ActiveRecord::Base
  self.table_name = 'users'

  # 出品した商品を持つ
  has_many :items, foreign_key: :user_id, dependent: :nullify
end

# 出品された商品
class Item < ActiveRecord::Base
  self.table_name = 'items'

  # 出品者を持つ
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
    # FIXME: エラーの渡し方を変更する
    @err = err
    status 401
    return erb :login
  end

  # メールアドレスからユーザーを取得
  user = User.find_by(email:)
  # ユーザーが存在しないか、パスワードが間違っていたらエラーを表示してログイン画面に戻る
  if user.nil? || !Argon2::Password.verify_password(password, user.hashed_password)
    # FIXME: エラーの渡し方を変更する
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
    # FIXME: エラーの渡し方を変更する
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
  rescue ArgumentError
    # パースに失敗したらnilを返す
    nil
  end

  # バリデーション
  ok, err = validate_new(name, description, image, type, deadline)
  # バリデーションに失敗したらエラーを表示して新規作成画面に戻る
  unless ok
    # FIXME: エラーの渡し方を変更する
    p err
    status 400
    return erb :new
  end

  # 商品を登録
  item = Item.create!(
    name:,
    description:,
    deadline: deadline&.iso8601,
    user_id: @user.id,
    created_at: Time.now.iso8601
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
