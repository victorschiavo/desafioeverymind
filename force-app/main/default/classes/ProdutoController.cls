public with sharing class ProdutoController {
    @AuraEnabled(cacheable=true)
    public static List<Produto__c> buscarProdutos(){
        try {
            List<Produto__c> produtolista = [select id,Name,CodigoProduto__c,DescricaoProduto__c,PrecoProduto__c from Produto__c];
            return produtolista;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deletarProdutos(List<Produto__c> produtoLista) {
        delete produtoLista;
    }

    @AuraEnabled
    public static void criarProduto(String nomeProduto, String descricaoProduto, Double precoProduto) {
        Produto__c produto = new Produto__c(Name = nomeProduto, DescricaoProduto__c = descricaoProduto, PrecoProduto__c = precoProduto);
        System.debug('#### Produto: ' + produto);
        insert produto;
    }

}