
// budget controller
var budgetController = (function(){
	
	var Expense = function(id, description, value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage = -1;
	};
	
	
	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome>0){
			this.percentage = Math.round(this.value / totalIncome * 100);
		}else{
			this.percentage = -1;
		}
		
	};
	
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}
	
	var Income = function(id, description, value){
		this.id=id;
		this.description=description;
		this.value=value;
	};
	
	var calculateTotal = function(type){
		var sum=0;
		data.allItems[type].forEach(function(current){
			sum = sum + current.value;						
		});
		data.totals[type] = sum;
	};
	
	
	
	var data = {
		allItems: {
			exp: [],
			inc:[]		
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type, description, value){
			var newItem, ID;
			// Create new ID
			if(data.allItems[type].length>0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1
			}else{
				ID = 0;
			}
			
			
			//Create new item based on 'inc' or 'exp' type
			if(type==='exp'){
				newItem = new Expense(ID, description, value);
			}else if(type==='inc'){
				newItem = new Income(ID, description, value);
			}
			
			// Push it into our data structure
			data.allItems[type].push(newItem);
			
			// Return the new element
			return newItem;
		
		},
		
		deleteItem: function(type, id){
			var index;
			var ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			if(index!==-1){
				data.allItems[type].splice(index,1);
			}
		},
		
		calculateBudget: function(){
			// Calculate total income and expenses__list
				calculateTotal('exp');
				calculateTotal('inc');
			// Calculate the budget: income - expenses__list
				data.budget = data.totals.inc - data.totals.exp;
			// Calculate the % of income that is spent
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
				
		},
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		
		calculatePercentages: function(){
			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.totals.inc);				
			});
		},

		getPercentages: function(){
			var allPercentages = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			
			return allPercentages;
		},
		
		testing: function(){
			console.log(data);
		}
	}
	
})();



//UI controller
var UIController = (function(){
	
	var DOMstrings={
		inputType: '.add__type',
		description: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	
	var formatNumber= function(number, type){
			var numberSplit, intPart, decPart, sign;
			/* + or - before umber
			exactly 2 decimal points
			comma seperated in thousands
			*/
			
			number = Math.abs(number);
			number = number.toFixed(2);
			
			numberSplit = number.split('.');
			intPart = numberSplit[0];
			
			if(intPart.length>3){
				intPart = intPart.substr(0,intPart.length-3) + ',' + intPart.substr(intPart.length-3,3);
			}
			
			decPart = numberSplit[1];
			
			type==='exp'? sign = '-': sign = '+';
			
			return sign + ' ' + intPart + '.' + decPart;
		};
		
		var nodeListForEach = function(list, callback){
				for (var i = 0; i<list.length; i++){
					callback(list[i], i);
				}
			};
	
	return{
		getInput: function(){
			return{
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.description).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)			
			}
		},
		
		addListItem: function(obj, type){
			var html, newhtml, element;
			// 1. Create HTML string with placeholder text
			
			if(type==='inc'){
				element = DOMstrings.incomeContainer;
				html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>\
<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">\
<button class="item__remove__button"><i class="ion-ios-close-outline"></i></button></div></div></div>';				
			}else if(type==='exp'){
				element=DOMstrings.expenseContainer;
				html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>\
<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>\
<div class="item__delete"><button class="item__remove__button"><i class="ion-ios-close-outline"></i></button></div></div></div>';				
			}

			// 2. Replace the placeholder text with some actual data
			newhtml = html.replace('%id%',obj.id);
			newhtml = newhtml.replace('%description%',obj.description);
			newhtml = newhtml.replace('%value%',formatNumber(obj.value, type));
			
			// 3. Insert the HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
		},
		
		deleteListItem: function(selectorID){
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},
		
		clearFields: function(){
			var fields, fieldsArr;
			
			fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.inputValue);
			fieldsArr=Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array){
				current.value="";
			});
			fieldsArr[0].focus();		
		},
		
		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			if(obj.percentage >0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '-';
			}
			
		},
		
		displayPercentages: function(percentages){
			
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
			
			
			nodeListForEach(fields, function(current, index){
				if(percentages[index]>0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '-';
				}
				
			});			
		},
		
		displayMonth: function(){
			var now, year, month, months;
			
			now = new Date();
			months = ['January', 'February', 'March','April','May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		
		changedType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ','+
				DOMstrings.description + ','+
				DOMstrings.inputValue
			);
			
			nodeListForEach(fields, function(current){
				current.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
			
			
		},
		
		getDOMstrings: function(){
				return DOMstrings;
		}
	}
	
})();




//Global app controller
var controller = (function(budgetCtrl, UICntrl){
	
	var setupEventListeners = function(){
		var DOM = UICntrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);
		document.addEventListener('keypress',function(event){
			if(event.keyCode===13 || event.which===13){
				controlAddItem();
			}
		});
		
		document.querySelector(DOM.container).addEventListener('click', controlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changedType);
		
	};
	
	var updateBudget = function(){
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		
		// 2. Return the budget
		var budget = budgetCtrl.getBudget();
		// 3. Dsiplay the budget to the UI
		UICntrl.displayBudget(budget);
	};
	
	var updatePercentages = function(){
		// Calculate the percentages
		budgetCtrl.calculatePercentages();
		// Read them from the budget controller
		var percentages = budgetCtrl.getPercentages();
		// Update the UI
		UICntrl.displayPercentages(percentages);
		
	}
	
	var controlAddItem = function(){
		var input, newItem;
		// 1. Get the filled input data
		input = UICntrl.getInput();
		
		if(input.description!=="" && !isNaN(input.value) && input.value>0){
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type,input.description, input.value);
		
			// 3. Add the item to the UI
			UICntrl.addListItem(newItem,input.type);
			
			// 4. Clear fields
			UICntrl.clearFields();

			// 5. Calculate and update budget
			updateBudget();
			
			// 6. Calculate and update percentages
			updatePercentages();
		}
	};
	
	var controlDeleteItem = function(event){
		var itemID, splitID, type, ID;
		itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			//inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type,ID);
			// 2. Delete the item from the UI
			UICntrl.deleteListItem(itemID);
			// 3. Update and show the new budget
			updateBudget();
			// 4. Calculate and update percentages
			updatePercentages();
		}
	}
	
	
	return{
		init: function(){
			UICntrl.displayMonth();
			setupEventListeners();
			UICntrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
		}
	}
	
})(budgetController, UIController);



controller.init();





























