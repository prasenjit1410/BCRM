public class RetrieveListOfOpportunity {
       @AuraEnabled
        public static List<opportunity> listOppLwc(){
           
           List<Opportunity> optyList=[SELECT Id,	Name,
													Account.Name, 
													Drive_Date__c,
													Description, 
													createdDate 
													FROM Opportunity 
													where StageName!= 'Closed' 
													order by createdDate desc ];
           return optyList;
           
       }
}
