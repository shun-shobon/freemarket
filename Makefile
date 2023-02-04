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
