
// 서버 도메인
let url = "https://구독관리서비스.site";

// 모달창
const modal = document.querySelector('#add-modal');
const inputName = document.querySelector('#add-modal input[type="text"]');
const inputDate = document.querySelector('#add-modal input[type="date"]');
const inputPrice = document.querySelector('#add-modal input[type="number"]');
const cycleNumber = document.querySelector('.input-cycle');
const submitBtn = document.querySelector('.submit-service');
const serviceList = document.querySelector('.service-list');
const updateStatus = modal.querySelector('.updateStatus');

// 메인화면
const addBtn = document.querySelector('.add-service-btn');
const closeBtn = document.querySelector('.close-btn');
