.PHONY: dev start

dev:
	bundle exec rerun fuyou.rb

start:
	bundle exec ruby fuyou.rb

reset:
	rm data.db
	sqlite3 data.db < dbinit.sq3
	rm -rf public/uploads
	mkdir public/uploads
	touch public/uploads/.gitkeep

compress:
	mkdir -p 19426
	cp -r public views database.yml dbinit.sq3 fuyou.rb Gemfile Gemfile.lock 19426/
	zip -r 19426.zip 19426/
