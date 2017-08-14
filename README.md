# quotes

This is the quotes server project.

Please install node 8.2+.

To run the project test suite - 
* `npm install`
* Ensure any processes running on port 5432 is killed
* `docker-compose up -d`
* wait until ` docker exec -it postgres psql -U bgrober` psqls you into the docker db as user bgrober
* `npm test`
