.PHONY: up down migrate seed prepare fresh test
up: ; docker compose up -d
down: ; docker compose down
migrate: ; bash bin/catalogo-aves migrate
seed: ; bash bin/catalogo-aves seed
prepare: ; bash bin/catalogo-aves prepare
fresh: ; bash bin/catalogo-aves fresh
test: ; bash bin/catalogo-aves test
