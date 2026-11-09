CONTRACTS_URL ?= https://github.com/Frobama/beacon-contracts.git
CONTRACTS_TAG ?= v0.1.0

.PHONY: proto
proto: ## Genera los stubs y exporta los .proto desde beacon-contracts
	buf export "$(CONTRACTS_URL)#tag=$(CONTRACTS_TAG)" -o proto
	buf generate "$(CONTRACTS_URL)#tag=$(CONTRACTS_TAG)" --template buf.gen.yaml
