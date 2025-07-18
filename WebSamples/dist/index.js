"use strict";
// src/index.ts
const button = document.getElementById("myButton");
if (button) {
    button.addEventListener("click", () => {
        alert("ボタンがクリックされました！！！");
    });
}
else {
    console.error("ボタンが見つかりませんでした！！！");
}
