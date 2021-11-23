import { wire,track,api,LightningElement } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { getRecord, getRecordNotifyChange } from 'lightning/uiRecordApi';
import fetchopportunities from '@salesforce/apex/RecurrencePatternPoCDataTableClass.listOppLwc';
import pubsub from 'c/pubsub';
import { NavigationMixin } from 'lightning/navigation';

const columns = [
    { label: 'Name', fieldName: 'Name'},
    { label: 'Account', fieldName: 'AccountName'},
    { label: 'Drive Date',fieldName: 'Drive_Date__c', type: 'string'},
    { label: 'Description', fieldName: 'Description'},
    { label: 'created Date', fieldName: 'CreatedDate'}

];

export default class RecurrencPatternDataTableCmp extends NavigationMixin(LightningElement) {

    @api dateListFromScreen1;

    @track columns = columns;
    @track data = [];
    @track dataLoaded = false;
    opprecordids = [];
    channelName = '/topic/RefreshOpptys';
    subscription = {};
    recordId;
    connectedCallback(){
        this.dataLoaded = false;
        //this.regiser();
        this.handleSubscribe();
    }

    renderedCallback(){
        console.log( 'template rendered tested' );
    }


    getOpprecords(){

        fetchopportunities()
        .then(result =>{
            console.log('Result for Datatable:',result);
            let currentData = [];
            let recordIds = [];
            result.forEach((row) => {
                let rowData = {};
                rowData.Id  = row.Id;
                rowData.Name = row.Name;
                rowData.Drive_Date__c = row.Drive_Date__c;
                rowData.Description = row.Description;
                rowData.CreatedDate = row.CreatedDate;
                if (row.Account) {
                    rowData.AccountName = row.Account.Name;
                }
                currentData.push(rowData);
                recordIds.push(row.Id);
                this.opprecordids = recordIds;
            });
            this.dataLoaded = true;
            this.data = currentData;            
        })
        .catch(error => {
            console.log( "error in fetch opportunity ", error );
        });
    }

    getSelectedName(event) {
        let selectedRows = event.detail.selectedRows;
        // you can write your own business logic here
    }

    // Handles subscribe button click
    handleSubscribe() {
        
        // Callback invoked whenever a new event message is received
        const messageCallback = function(response){
            console.log('New message received: ', JSON.stringify(response));           
            // Response contains the payload of the new message received
            fetchopportunities()
            .then(result =>{
                console.log('Result for Datatable inside callback is :',result);
                let currentData = [];
                let recordIds = [];
                result.forEach((row) => {
                    let rowData = {};
                    rowData.Id  = row.Id;
                    rowData.Name = row.Name;
                    rowData.Drive_Date__c = row.Drive_Date__c;
                    rowData.Description = row.Description;
                    rowData.CreatedDate = row.CreatedDate;
                    if (row.Account) {
                        rowData.AccountName = row.Account.Name;
                    }
                    currentData.push(rowData);
                    recordIds.push(row.Id);
                });
                this.data = currentData;
                
            })
            .catch(error => {
                console.log( "error in fetch opportunity ", error );
            });
        }.bind(this); 

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
            this.handleopprecords(true);
        });
    }

    

    handleopprecords(enableSubscribe) {
        console.log( 'after subscribe' );
        this.getOpprecords();
    }

}
