document.addEventListener("DOMContentLoaded",function(){var e=document.querySelector(".main"),t=document.getElementById("login"),n=t.querySelector("input"),r=t.querySelector(".q"),o=document.getElementById("logout");localStorage.getItem("isLoginProcessed")?(t.remove(),document.querySelector('div[style="padding: .555em;width: 100%;"]').appendChild(e)):(e.remove(),r?r.addEventListener("click",function(r){r.preventDefault(),"pirate"===n.value.toLowerCase()&&(t.remove(),document.querySelector('div[style="padding: .555em;width: 100%;"]').appendChild(e),localStorage.setItem("isLoginProcessed",!0),location.reload())}):console.error("Кнопка не найдена")),o?o.addEventListener("click",function(){localStorage.removeItem("isLoginProcessed"),location.reload()}):console.error("Кнопка выхода не найдена")}),document.addEventListener("DOMContentLoaded",function(){var e=document.querySelector("main.main"),t=document.getElementById("logout");!e&&t&&t.remove()}),document.addEventListener("DOMContentLoaded",function(){var e=document.querySelector(".main"),t=document.querySelector(".menu");e||(t.classList.remove("menu"),t.classList.add("toggle"))});
