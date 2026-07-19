/*
==================================================

StressCheck

export.js

PART 9.1

Export JSON
Reset
Toast
Dark Mode

==================================================
*/

function showToast(message){

    let toast=document.getElementById("toast");

    if(!toast){

        toast=document.createElement("div");

        toast.id="toast";

        toast.className="toast";

        document.body.appendChild(toast);

    }

    toast.innerHTML=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

function downloadJSON(){

    const data={

        profile:

        SurveyEngine.profile,

        answers:

        SurveyEngine.answers,

        result:

        SCORE_ENGINE,

        createdAt:

        new Date()

    };

    const blob=

    new Blob(

        [

        JSON.stringify(

            data,

            null,

            4

        )

        ],

        {

            type:

            "application/json"

        }

    );

    const url=

    URL.createObjectURL(

        blob

    );

    const a=

    document.createElement("a");

    a.href=url;

    a.download=

    "StressReport.json";

    a.click();

    URL.revokeObjectURL(url);

    showToast(

    "Đã lưu JSON"

    );

}

function restartSurvey(){

    if(

        !confirm(

        "Bạn muốn làm lại khảo sát?"

        )

    )

    return;

    location.reload();

}

function toggleDarkMode(){

    document.body

    .classList

    .toggle(

        "dark"

    );

}

document

.getElementById(

"restartSurvey"

)

.addEventListener(

"click",

restartSurvey

);

document

.getElementById(

"downloadJSON"

)

.addEventListener(

"click",

downloadJSON

);

/*
Cần thêm

html2canvas

jspdf

*/

async function exportPDF(){

    document.body

    .classList

    .add(

        "pdf-mode"

    );

    const pdf=

    new jspdf.jsPDF(

        "p",

        "mm",

        "a4"

    );

    const page=

    document

    .getElementById(

        "resultPage"

    );

    const canvas=

    await html2canvas(

        page,

        {

            scale:2

        }

    );

    const img=

    canvas.toDataURL(

        "image/png"

    );

    const w=190;

    const h=

    canvas.height

    *

    w

    /

    canvas.width;

    pdf.addImage(

        img,

        "PNG",

        10,

        10,

        w,

        h

    );

    pdf.save(

        "StressReport.pdf"

    );

    document.body

    .classList

    .remove(

        "pdf-mode"

    );

}

document

.getElementById(

"downloadPDF"

)

.addEventListener(

"click",

exportPDF

);

function animateNumber(

element,

target,

suffix="%"

){

let current=0;

const step=

target/40;

const timer=

setInterval(()=>{

current+=step;

if(current>=target){

current=target;

clearInterval(timer);

}

element.innerHTML=

current.toFixed(1)

+

suffix;

},20);

}

setTimeout(()=>{

    const el = document.querySelector("#overallStress h1");
    if (el) {
        animateNumber(el, SCORE_ENGINE.overallStress);
    }

},300);

function animateCards(){

document

.querySelectorAll(

".card"

)

.forEach(

(card,index)=>{

card.style.opacity=0;

card.style.transform=

"translateY(30px)";

setTimeout(()=>{

card.style.opacity=1;

card.style.transform=

"translateY(0px)";

},index*120);

});

}

function saveLocal(){

localStorage.setItem(

"StressCheck",

JSON.stringify({

profile:

SurveyEngine.profile,

answers:

SurveyEngine.answers,

result:

SCORE_ENGINE

})

);

}

function restoreLastResult(){

const raw=

localStorage.getItem(

"StressCheck"

);

if(!raw)

return null;

return JSON.parse(raw);

}

window.addEventListener(

"load",

()=>{

const last=

restoreLastResult();

if(last){

console.log(

"Có kết quả cũ."

);

}

});