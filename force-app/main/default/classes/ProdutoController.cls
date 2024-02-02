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
}