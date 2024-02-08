import { LightningElement, wire, track } from 'lwc';
import buscarProdutos from '@salesforce/apex/ProdutoController.buscarProdutos';
import deletarProdutos from '@salesforce/apex/ProdutoController.deletarProdutos';
import criarProdutos from '@salesforce/apex/ProdutoController.criarProduto';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

// columns
const columns = [
    {
        label: 'Nome do Produto',
        fieldName: 'Name',
        type: 'text',
        editable: true,
    }, {
        label: 'Código do Produto',
        fieldName: 'CodigoProduto__c',
        type: 'text',
        editable: false,
    }, {
        label: 'Descrição do Produto',
        fieldName: 'DescricaoProduto__c',
        type: 'text',
        editable: true,
    }, {
        label: 'Preço',
        fieldName: 'PrecoProduto__c',
        editable: true
    }
];


export default class DataTableProduto extends LightningElement {
    columns = columns;
    @track produtos;
    @track buttonLabel = 'Deletar Produtos';
    @track isTrue = false;
    @track recordsCount = 0;
    @track isModalOpen = false;
    saveDraftValues = [];

    productId;
    name = '';
    description = '';
    price = 0;
 
    handleChange(event) {
        const field = event.target.name;
        if (field === 'nomeProduto') {
            this.name = event.target.value;
        } else if (field === 'descricaoProduto') {
            this.description = event.target.value;
        } else if (field === 'precoProduto') {
            this.price = event.target.value;
        }
    }

    @wire(buscarProdutos)
    produtosData(result) {
        this.refreshTable = result;
        this.produtos = result;
        if (result.error) {
            this.produtos = undefined;
        }
    };

    getSelectedRecords(event) {        
        const selectedRows = event.detail.selectedRows;
        this.recordsCount = event.detail.selectedRows.length;
        this.selectedRecords=new Array();
        for (let i = 0; i < selectedRows.length; i++) {
            this.selectedRecords.push(selectedRows[i]);
        }        
    }
 
    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.ShowToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            this.ShowToast('Error', 'An Error Occured!!', 'error', 'dismissable');
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }

    deleteRecords() {
        if (this.selectedRecords) {
            this.buttonLabel = 'Processing....';
            this.isTrue = true;
            deletarProdutos({produtoLista: this.selectedRecords }).then(result => {
                window.console.log('result ====> ' + result);
                this.buttonLabel = 'Delete Records';
                this.isTrue = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!!',
                        message: this.recordsCount + ' records are deleted.',
                        variant: 'success'
                    }),
                );
                this.template.querySelector('lightning-datatable').selectedRows = [];
                this.recordsCount = 0;
                return refreshApex(this.refreshTable);
            }).catch(error => {
                this.buttonLabel = 'Delete Records';
                this.isTrue = false;                
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while getting Products',
                        message: JSON.stringify(error),
                        variant: 'error'
                    }),
                );
            });
        }
        
    }
 
    ShowToast(title, message, variant, mode){
        const evt = new ShowToastEvent({
                title: title,
                message:message,
                variant: variant,
                mode: mode
            });
            this.dispatchEvent(evt);
    }
 
    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.produtos);
    }

    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }
    submitDetails() {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing
        criarProdutos({nomeProduto: this.name, descricaoProduto: this.description, precoProduto: this.price})
            .then(produto => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Produto criado com sucesso',
                        variant: 'success',
                    }),
                );
                return refreshApex(this.refreshTable);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: 'Ocorreu um erro inesperado',
                        variant: 'error',
                    }),
                );
            });
        console.log('### Valores produto: ' + this.name + ' ' + this.description + ' ' + this.price);
        this.isModalOpen = false;
    }

}