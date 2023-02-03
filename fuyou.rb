# frozen_string_literal: true

require 'sinatra'
require 'active_record'
require 'time'
require 'dotenv'
require 'securerandom'
require 'argon2'

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
end

# 出品された商品
class Item < ActiveRecord::Base
  self.table_name = 'items'
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
    @err = err
    status 401
    return erb :login
  end

  user = User.find_by(email:)
  if user.nil? || !Argon2::Password.verify_password(password, user.hashed_password)
    @err = 'メールアドレスかパスワードが間違っています'
    status 401
    return erb :login
  end

  session[:user_id] = user.id
  redirect '/'
end

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

def validate_register(name, email, password)
  return [false, '名前を入力してください'] if name.nil? || name.empty?
  return [false, 'メールアドレスを入力してください'] if email.nil? || email.empty?
  return [false, 'パスワードを入力してください'] if password.nil? || password.empty?

  [true, nil]
end

