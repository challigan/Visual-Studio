document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("addCondition").addEventListener("click", addCondition);
    document.getElementById("addGroup").addEventListener("click", addGroup);
    document.getElementById("generateQuery").addEventListener("click", generateQuery);
    document.getElementById("resetForm").addEventListener("click", resetForm);
    document.getElementById("copyToClipboard").addEventListener("click", copyToClipboard);
});

function addCondition() {
    const condition = createConditionElement(true);
    document.getElementById("queryForm").appendChild(condition);
}

function resetForm() {
    // Reset the form inputs
    document.getElementById("queryForm").reset();
    document.getElementById("generatedQuery").innerHTML = "";
  
    // Remove all existing conditions and groups
    const conditions = document.querySelectorAll(".condition");
    const groups = document.querySelectorAll(".group");
    
    conditions.forEach((condition, index) => {
      if (index > 0) {
        condition.remove();
      }
    });
  
    groups.forEach(group => {
      group.remove();
    });
  
    // Add a single condition row
  }
  
  
  function copyToClipboard() {
    const range = document.createRange();
    range.selectNode(document.getElementById("generatedQuery"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
  
    // Show a message to the user, indicating the text has been copied
    alert("Output copied to clipboard.");
  }
  

function addGroup() {
    const group = document.createElement("div");
    group.className = "group";
    group.innerHTML = `

        <div class="conditions">        
        <select class="groupOperator">
        <option value="and">and</option>
        <option value="or">or</option>
        </select>
        <button type="button" class="addGroupCondition">Add Condition</button>
        </div>
    `;
    document.getElementById("queryForm").appendChild(group);
    group.querySelector(".conditions").appendChild(createConditionElement());

    group.querySelector(".addGroupCondition").addEventListener("click", function() {
        group.querySelector(".conditions").appendChild(createConditionElement(true));
    });
}

function createConditionElement(hasConditionOperator = false) {
    const condition = document.createElement("div");
    condition.className = "condition";
    condition.innerHTML = `
        ${hasConditionOperator ? '<select class="conditionOperator"><option value="and">and</option><option value="or">or</option></select>' : ''}
        <input type="text" placeholder="Column Name" class="columnName">
        <select class="operator">
        <option value="eq">Equals</option>
        <option value="ne">Not Equals</option>
        <option value="gt">Greater Than</option>
        <option value="lt">Less Than</option>
        <option value="ge">Greater or Equals</option>
        <option value="le">Less or Equals</option>
        <option value="startswith">Starts With</option>
        <option value="substringof">Contains</option>
        </select>
        <input type="text" placeholder="Column Value" class="columnValue">
    `;
    return condition;
}

function generateQuery() {
    const conditions = document.querySelectorAll(".condition:not(.group .condition)");
    const groups = document.querySelectorAll(".group");
    let query = "";

    conditions.forEach((condition, index) => {
        const conditionOperator = condition.querySelector(".conditionOperator") ? condition.querySelector(".conditionOperator").value : "";
        const columnName = condition.querySelector(".columnName").value;
        const operator = condition.querySelector(".operator").value;
        const columnValue = condition.querySelector(".columnValue").value;

        if (columnName && columnValue) {
            query += index > 0 ? ` ${conditionOperator} ` : "";
            const formattedValue = isNaN(columnValue) ? `'${columnValue}'` : columnValue;
            
            if (operator === "startswith") {
                query += `${operator}(${columnName},${formattedValue})`;
            }
            else {if (operator === "substringof") {
                query += `${operator}(${formattedValue},${columnName})`;
            }
            else {
                query += `${columnName} ${operator} ${formattedValue}`;
            }
        }
            
        }
    });

    groups.forEach((group) => {
        const groupOperator = group.querySelector(".groupOperator").value;
        const groupConditions = group.querySelectorAll(".condition");
        let groupQuery = "";

        groupConditions.forEach((condition, index) => {
            const conditionOperator = condition.querySelector(".conditionOperator") ? condition.querySelector(".conditionOperator").value : "";
            const columnName = condition.querySelector(".columnName").value;
            const operator = condition.querySelector(".operator").value;
            const columnValue = condition.querySelector(".columnValue").value;

            if (columnName && columnValue) {
                groupQuery += index > 0 ? ` ${conditionOperator} ` : "";
                const formattedValue = isNaN(columnValue) ? `'${columnValue}'` : columnValue;

                if (operator === "startswith" || operator === "substringof") {
                    groupQuery += `${operator}(${formattedValue},${columnName})`;
                } else {
                    groupQuery += `${columnName} ${operator} ${formattedValue}`;
                }
            }
        });

        if (groupQuery) {
            query += query ? ` ${groupOperator} ` : "";
            query += `(${groupQuery})`;
        }
    });

    document.getElementById("generatedQuery").innerHTML = query;
}
