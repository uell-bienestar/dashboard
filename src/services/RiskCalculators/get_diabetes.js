/**
  
    Type II Diabetes Risk Score
    
    @param {int} age - the age of the patient (patient resource)
    @param {string} gender - sex of the patient (patient resource)
    @param {int} bmi - body mass index (condition resource)
    @param {boolean} hyperglycemia - condition records of hyperglycemia (condition resource)
    @param {boolean} historyOfAntihypDrugs - history of antihypertensive drugs (??? resource) //currently hardcoded
    @param {int} waist - waist circumference (condition resource)

    @return diabetes risk score

*/

const WAIST_CIRCUM = ['56115-9', '56114-2', '56117-5', '8280-0', '8281-8'];
const BMI = '39156-5';
import {calculateAge, pullCondition} from '../../services/risk_score_utils.js';

export function calcDiabetesRisk(age, gender, bmi, hyperglycemia, historyOfAntihypDrugs, waist) {
          //starts with the intercept
        let exp_factor = -5.514;
        //age
        if (age < 54 && age > 45){
          exp_factor += 0.628;
        } else if (age > 55 && age < 64){
          exp_factor += 0.892;
        } else {
          //its good that we have this, removed for demo.
          //alert ("This risk score does not apply, due to age restrictions.");
          //return;
        }

        //BMI
        if (bmi > 25 && bmi < 30){
          exp_factor += 0.165;
        } else if (bmi >= 30){
          exp_factor += 1.096;
        } else {
          //its good that we have this, removed for demo.
          //alert ("This risk score does not apply, due to BMI restrictions.");
          //return;
        }

        //high blood glucose
        if (hyperglycemia){
          exp_factor += 2.139;
        }

        //History of antihypertensive drug treatment
        if (historyOfAntihypDrugs){
          exp_factor += 0.711;
        }

        //waist circumference
        if (gender == "male"){
          if (waist > 94 && waist < 102){
            exp_factor += 0.857;
          } else if (waist >= 102 ) {
            exp_factor += 1.350;
          }
          // console.log("This is the first console: ",scoreSets[i]);
        } else if (gender == "female") {
          if (waist > 80 && waist < 88){
            exp_factor += 0.857;
          } else if (waist >= 89) {
            exp_factor += 1.350;
          }
        } else {
          //its good that we have this, removed for demo.
          //alert ("This risk score does not apply, due to gender restrictions.");
          //return;
        }
        //console.log("exp factor", exp_factor);
        var score = 100*(Math.pow(Math.E, exp_factor))/(1+Math.pow(Math.E, exp_factor));
        score = score.toFixed(0);
        //console.log("score", score);
        return score;
}

export function diabetesScore(pt, obs, conds, medreq) {
  var waist = pullCondition(obs, ['56115-9', '56114-2', '56117-5', '8280-0', '8281-8'])
  var bmi = pullCondition(obs, ['39156-5']);
  var hyperglycemia = pullCondition(conds, ['80394007']);
  if (waist.length == 0 || bmi.length == 0) {
    alert("Patient does not have sufficient measurements for Diabetes Risk Score.");
    ////console.log(bmi, waist);
    return;
  }
  var score = calcDiabetesRisk(calculateAge(pt[0].birthDate),
    pt[0].gender,
    bmi[0].valueQuantity.value,
    (hyperglycemia.length != 0),
    false, //NEEDS TO BE FIXED
    waist[0].valueQuantity.value);
  return score;
}

// function diabetesRisk() {
//   var smart = getPatID("patDiabRisk");
//   var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: [
//            //waist circumference
//            'http://loinc.org|56115-9',
//            'http://loinc.org|56114-2', 'http://loinc.org|56117-5',
//            'http://loinc.org|8280-0', 'http://loinc.org|55284-4', 'http://loinc.org|8281-8'
//            , 'http://loinc.org|39156-5', 
//            //BMI
//            'http://loinc.org|39156-5',
//            ]}}});

//   var labs2 = smart.patient.api.fetchAll({type: "Condition", query: {code: {$or: [
//             // hyperglycemia (high blood glucose)
//            '80394007'
//            ]}}});

//   //not sure if the 'type' is the right one in the  prescribe->dispense->administer sequence, but its the one with the most data.
//   var labs3 = smart.patient.api.fetchAll({type: "MedicationRequest", query: {'context.diagnosis.code': {$or: [
//             // History of antihypertensive drug treatment
//             //MedicationRequest?context.reason=10509002
//            '38341003'
//            ]}}});

//   $.when(getPatient(smart), labs, labs2, labs3).done(function(patRaw, labs, labs2, labs3) {
//     console.log(labs, labs2, labs3);

//     var score;
//     let validPatient = true;
//     let hasHistoryOfAntihypDrugs = false;
//     let hasHyperglycemia = false;

//     if (patRaw.data.total == 0) {
//       alert("This patient does not exist.");
//       validPatient = false;
//     }
//     else {
//       var age = calculateAge(patRaw.data.entry[0].resource.birthDate);
//       var gender = patRaw.data.entry[0].resource.gender;
//     }

//     if (labs3 != null){
//       hasHistoryOfAntihypDrugs = true;
//     }

//     var hyperglycemia = pullCondition(labs2, ['80394007'])
//     if (hyperglycemia != null){
//       hasHyperglycemia = true;
//     }

//     labs = _.sortBy(labs, 'effectiveDateTime').reverse();
    
//     var byCodes = smart.byCodes(labs, 'code');
//     var waistCircumArr = byCodes('56115-9');
//     var bmiArr = byCodes(BMI);


//     var scoreSets = findPriorSets({bmiArr, waistCircumArr}, 
//       [["39156-5"], ['56115-9', '56114-2', '56117-5', '8280-0', '8281-8']],
//       ['BMI', 'waist'], labs);

//     if(scoreSets.length === 0) {
//       validPatient = false;
//     }
//     if (validPatient) {
//       for(var i = 0; i < scoreSets.length; i++) {
//         //scoreSets[i][BP].component[0].valueQuantity.value
//         console.log("array waist", scoreSets[i]);

//         //starts with the intercept
//         let exp_factor = -5.514;

//         //age
//         if (age < 54 && age > 45){
//           exp_factor += 0.628;
//         } else if (age > 55 && age < 64){
//           exp_factor += 0.892;
//         } else {
//           alert ("This risk score does not apply, due to age restrictions.");
//           return;
//         }

//         //BMI
//         if (scoreSets[i]['BMI'].valueQuantity.value > 25 && scoreSets[i]['BMI'].valueQuantity.value < 30){
//           exp_factor += 0.165;
//         } else if (scoreSets[i]['BMI'].valueQuantity.value >= 30){
//           exp_factor += 1.096;
//         } else {
//           alert ("This risk score does not apply, due to BMI restrictions.");
//           return;
//         }

//         //high blood glucose
//         if (hasHyperglycemia){
//           exp_factor += 2.139;
//         }

//         //History of antihypertensive drug treatment
//         if (hasHistoryOfAntihypDrugs){
//           exp_factor += 0.711;
//         }

//         //waist circumference
//         if (gender == "male"){
//           if (scoreSets[i]['waist'].valueQuantity.value > 94 && scoreSets[i]['waist'].valueQuantity.value < 102){
//             exp_factor += 0.857;
//           } else if (scoreSets[i]['waist'].valueQuantity.value >= 102 ) {
//             exp_factor += 1.350;
//           }
//           // console.log("This is the first console: ",scoreSets[i]);
//         } else if (gender == "female") {
//           if (scoreSets[i]['waist'].valueQuantity.value > 80 && scoreSets[i]['waist'].valueQuantity.value < 88){
//             exp_factor += 0.857;
//           } else if (scoreSets[i]['waist'].valueQuantity.value >= 89) {
//             exp_factor += 1.350;
//           }
//         } else {
//           alert ("This risk score does not apply, due to gender restrictions.");
//           return;
//         }

//         score = 100*(Math.pow(Math.E, exp_factor))/(1+Math.pow(Math.E, exp_factor));
//         score = score.toFixed(2);
//         let sum = 0;
//         let counter = 0;
//         let tempTime;
//         let maxTime = 0;
//         for(variable in scoreSets[i]) {
//           tempTime = new Date(scoreSets[i][variable].effectiveDateTime);
//           sum += tempTime.getTime();
//           if (tempTime > maxTime) {
//             maxTime = tempTime;
//           }
//           counter++;
//         }
//         avgDate = new Date(sum/counter)
//         alert("As of " + new Date(maxTime) + ", your chance of getting Type 2 diabetes in the next ten years is " + score + "%.");
//       }
//     }
//     else {
//       alert("This patient is missing one of the measurements needed for the calculation.");
//     }
//   });
// }
