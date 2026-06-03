let expression = "";
let lastAnswer = 0;

const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

function updateDisplay() {
    expressionDisplay.textContent = expression;
}

function updateResult(result) {
    result = parseFloat(Number(result).toFixed(4));
    resultDisplay.textContent = result;

    if (result.toString().length > 10) {
        resultDisplay.style.fontSize = "40px";
    } else {
        resultDisplay.style.fontSize = "64px";
    }
}

function appendValue(value) {
    expression += value;
    updateDisplay();
}

function clearDisplay() {
    expression = "";
    resultDisplay.textContent = "0";
    resultDisplay.style.fontSize = "64px";
    updateDisplay();
}

function deleteLast() {
    // If the last token was "√(", delete both characters together
    if (expression.endsWith("√(")) {
        expression = expression.slice(0, -2);
    } else {
        expression = expression.slice(0, -1);
    }
    updateDisplay();
}

function useAns() {
    expression += lastAnswer;
    updateDisplay();
}

function calculate() {
    if (expression.trim() === "") return;

    try {
        let exp = expression;

        // 1. Convert percentages
        exp = exp.replace(/%/g, "/100");

        // 2. Convert √(expression) into Math.sqrt(expression)
        exp = exp.replace(/√\(/g, "Math.sqrt(");

        // 3. Auto-close missing parentheses if user forgot them
        const openCount = (exp.match(/\(/g) || []).length;
        const closeCount = (exp.match(/\)/g) || []).length;
        if (openCount > closeCount) {
            exp += ")".repeat(openCount - closeCount);
        }

        let result = eval(exp);

        // Handle cases like Math.sqrt(-9) which returns NaN
        if (isNaN(result) || result === Infinity || result === -Infinity) {
            resultDisplay.textContent = "Error";
            return;
        }

        updateResult(result);
        lastAnswer = result;

    } catch {
        resultDisplay.textContent = "Error";
    }
}

function toggleSign() {
    if (expression.trim() === "") return;

    try {
        // Evaluate current state to apply negative toggle safely
        let exp = expression.replace(/%/g, "/100").replace(/√\(/g, "Math.sqrt(");
        let value = eval(exp);
        
        value *= -1;
        expression = value.toString();
        
        updateDisplay();
        updateResult(value);
    } catch {
        resultDisplay.textContent = "Error";
    }
}

// Keyboard support
document.addEventListener("keydown", (e) => {
    const allowedKeys = "0123456789+-*/.%()";

    if (allowedKeys.includes(e.key)) {
        appendValue(e.key);
    }

    // Optional: map 'r' or 'q' key to square root if desired
    if (e.key.toLowerCase() === "r") {
        appendValue("√(");
    }

    if (e.key === "Enter") {
        calculate();
    }

    if (e.key === "Backspace") {
        deleteLast();
    }

    if (e.key === "Escape") {
        clearDisplay();
    }
});