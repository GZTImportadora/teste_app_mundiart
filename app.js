function validarToken(){

const token = localStorage.getItem("token");

if(!token){

window.location.href = "login.html";
return;

}

const dados = JSON.parse(atob(token));

if(Date.now()/1000 > dados.exp){

localStorage.removeItem("token");

window.location.href = "login.html";

}

}

validarToken();