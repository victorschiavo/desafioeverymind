import { LightningElement,wire,track,api} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

import buscarProdutos from '@salesforce/apex/ProdutoController.buscarProdutos';

export default class produtoLwc extends LightningElement {
    produtolista;
    
    @api recordId;
    @api objectApiName;

    @wire(buscarProdutos) 
    buscarProdutosFunc({ error, data }) {
            if (data) {
                this.produtolista = data;
            } else if (error){
                console.log('error : ',error);
            }
    }
}