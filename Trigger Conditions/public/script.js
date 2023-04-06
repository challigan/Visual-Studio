document.addEventListener('DOMContentLoaded', () => {
    const addConditionButton = document.getElementById('add-condition');
    const conditionForm = document.getElementById('condition-form');
    const conditionsContainer = document.getElementById('conditions-container');
    const output = document.getElementById('output');
    const resetButton = document.getElementById('reset');
    const copyToClipboardButton = document.getElementById('copy-to-clipboard');

    copyToClipboardButton.addEventListener('click', () => {
        if (output.innerHTML) {
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = output.textContent.replace('Trigger Condition: ', '');
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
            alert('Trigger condition copied to clipboard!');
        } else {
            alert('There is no trigger condition to copy.');
        }
    });

    resetButton.addEventListener('click', () => {
        // Remove all additional condition rows
        while (conditionsContainer.children.length > 1) {
            conditionsContainer.removeChild(conditionsContainer.lastChild);
        }

        // Reset the first condition row
        conditionsContainer.firstElementChild.querySelector('.column-type').selectedIndex = 0;
        conditionsContainer.firstElementChild.querySelector('.column-name').value = '';
        conditionsContainer.firstElementChild.querySelector('.column-value').value = '';

        // Update function options and column value input for the first condition row
        const firstColumnType = conditionsContainer.firstElementChild.querySelector('.column-type');
        updateFunctionOptions(firstColumnType);
        updateColumnValueInput(firstColumnType);

        // Reset the operator
        conditionForm.querySelector('input[name="operator"][value="and"]').checked = true;

        // Clear the output
        output.innerHTML = '';
    });

    function updateFunctionOptions(columnTypeElement) {
        const functionSelect = columnTypeElement.closest('.condition-row').querySelector('.function');
        const currentValue = functionSelect.value;

        const functionsForType = {
            string: ['equals', 'not-equals', 'contains', 'empty', 'not-empty', 'starts-with', 'ends-with'],
            number: ['equals', 'not-equals', 'greater-than', 'greater-or-equal', 'less-than', 'less-or-equal', 'empty', 'not-empty'],
            boolean: ['equals', 'not-equals'],
            choice: ['equals', 'not-equals', 'empty', 'not-empty']
        };

        const type = columnTypeElement.value;
        const options = functionsForType[type];

        functionSelect.innerHTML = '';

        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.text = option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            functionSelect.appendChild(opt);
        });

        if (options.includes(currentValue)) {
            functionSelect.value = currentValue;
        } else {
            functionSelect.selectedIndex = 0;
        }
    }

    function updateColumnValueInput(columnTypeElement) {
        const columnValueInput = columnTypeElement.closest('.condition-row').querySelector('.column-value');

        if (columnTypeElement.value === 'boolean') {
            const newSelect = document.createElement('select');
            newSelect.name = columnValueInput.name;
            newSelect.className = columnValueInput.className;

            const trueOption = document.createElement('option');
            trueOption.value = 'true';
            trueOption.text = 'True';
            newSelect.appendChild(trueOption);

            const falseOption = document.createElement('option');
            falseOption.value = 'false';
            falseOption.text = 'False';
            newSelect.appendChild(falseOption);

            columnValueInput.replaceWith(newSelect);
        } else {
            if (columnValueInput.tagName.toLowerCase() === 'select') {
                const newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.name = columnValueInput.name;
                newInput.className = columnValueInput.className;
                newInput.placeholder = 'Column Value';
                columnValueInput.replaceWith(newInput);
            }
        }
    }

    function addEventListenersToColumnType(columnTypeElement) {
        columnTypeElement.addEventListener('change', (event) => {
            updateFunctionOptions(event.target);
            updateColumnValueInput(event.target);
        });
    }

    addConditionButton.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.className = 'condition-row';
        newRow.innerHTML = conditionsContainer.firstElementChild.innerHTML;
        conditionsContainer.appendChild(newRow);

        const newColumnType = newRow.querySelector('.column-type');
        addEventListenersToColumnType(newColumnType);

        updateFunctionOptions(newColumnType);
        updateColumnValueInput(newColumnType);
    });

    conditionForm.querySelectorAll('.column-type').forEach(columnTypeElement => {
        addEventListenersToColumnType(columnTypeElement);
    });

    // Rest of the code for handling form submission
    conditionForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        const columnTypes = Array.from(conditionForm.querySelectorAll('.column-type'));
        const columnNames = Array.from(conditionForm.querySelectorAll('.column-name'));
        const functions = Array.from(conditionForm.querySelectorAll('.function'));
        const columnValues = Array.from(conditionForm.querySelectorAll('.column-value'));
        const operator = conditionForm.querySelector('input[name="operator"]:checked').value;
    
        let triggerConditions = [];
        for (let i = 0; i < columnNames.length; i++) {
            const columnType = columnTypes[i].value;
            const columnName = columnNames[i].value.trim();
            const func = functions[i].value;
            const columnValue = columnValues[i].value.trim();
        
            if (!columnName) {
                continue;
            }
        
            const valueKey = columnType === 'choice' ? "?['Value']" : '';
        
            // Use 'null' if the column value is empty
            const formattedColumnValue = columnValue === '' ? 'null' : columnType === 'string' ? `'${columnValue}'` : columnValue;
        
            let condition = '';
            switch (func) {
                case 'equals':
                    condition = `@equals(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                    break;
                case 'not-equals':
                    condition = `@not(equals(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue}))`;
                    break;
                case 'contains':
                    if (columnType === 'string') {
                        condition = `@contains(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                    }
                    break;
                case 'greater-than':
                    condition = `@greater(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                    break;
                case 'greater-or-equal':
                    condition = `@greaterOrEquals(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                    break;
                case 'less-than':
                    condition = `@less(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                    break;
                case 'less-or-equal':
                    condition = `@lessOrEquals(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                    break;
                    case 'empty':
                        condition = `@empty(triggerBody()?['${columnName}']${valueKey})`;
                        break;
                    case 'not-empty':
                        condition = `@not(empty(triggerBody()?['${columnName}']${valueKey}))`;
                        break;
                    case 'starts-with':
                        if (columnType === 'string') {
                            condition = `@startsWith(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                        }
                        break;
                    case 'ends-with':
                        if (columnType === 'string') {
                            condition = `@endsWith(triggerBody()?['${columnName}']${valueKey}, ${formattedColumnValue})`;
                        }
                        break;
                
            }
        
            // Remove the @ symbol from the beginning of each condition
            if (condition.startsWith('@')) {
                condition = condition.substring(1);
            }
        
            if (condition) {
                triggerConditions.push(condition);
            }
        }                

        if (triggerConditions.length > 0) {
            let outputCondition = '';
    
            // If there's only one condition, don't include @and() or @or()
            if (triggerConditions.length === 1) {
                outputCondition = `@${triggerConditions[0]}`;
            } else {
                outputCondition = `@${operator.toLowerCase()}(${triggerConditions.join(', ')})`;
            }
    
            output.innerHTML = `${outputCondition}`;
        } else {
            output.innerHTML = 'No valid conditions were provided.';
        }
    });
});