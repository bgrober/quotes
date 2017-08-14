# quotes

This is the quotes server project.

Please install node 8.2+.
Please install docker.

To run the project test suite - 
* Ensure any processes running on port 5432 is killed
* `npm install`
* `docker-compose up -d`
* wait until ` docker exec -it postgres psql -U bgrober` psqls you into the docker db as user bgrober
* `npm test`
