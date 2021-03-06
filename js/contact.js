var mails;
var mailreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
var phonereg = /^(\+61)[0-9]{1}[0-9]{4}[0-9]{4}$/;
// for contact page
function openContact(evt, cityName) {
    selectName=cityName;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabMail");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
    if(cityName == 'compose'){
      resetForm();
    }
    if(cityName == 'inbox'){
      inbox();
    }
    if(cityName == 'sentmail'){
      sentMail();
    }
    if(cityName == 'draft'){
      draft();
    }
}

function inbox(){
  xmlHttp = GetXmlHttpObject();
if (xmlHttp==null)
 {
 alert ("Browser does not support HTTP Request");
 return 0;
 }
 var url='php/contact.php';
 var params = "";
 params += "inbox=1";
 xmlHttp.open("POST",url,true);
 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 xmlHttp.onreadystatechange=stateChangedforInbox;
 xmlHttp.send(params);
}

var row = 0 ;
function getRow(r){
  var i = r.parentNode.rowIndex;
  return i;
}

function InfobyRow1(r){
  var arr = new Array();
  if(selectName == "inbox"){
    for(var m=0 ; m<4;m++){
    arr[m] = document.getElementById('tableForInbox').rows[row].cells[m].innerText;
  }
  }else{
    for(var m=0 ; m<3;m++){
      if(selectName == "sentmail"){
        arr[m] = document.getElementById('tableForSentMail').rows[row].cells[m].innerText;
      }else if(selectName == "draft"){
        arr[m] = document.getElementById('tableForDraft').rows[row].cells[m].innerText;
      }
	  }
  }
 return arr ;
}

function stateChangedforInbox(){
if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete"){
    var str=xmlHttp.responseText;
    var obj = eval('(' + str + ')');
    mails = obj;
    var mess = "<table id='tableForInbox'>";
    if(obj.length == 0){
      mess+="<tr><td>No Received Mails</td></tr>";
    }
    for(var c = 0;c<obj.length;c++){
      if(obj[c].inbox.status == 0){
        mess+="<tr><td><i class='material-icons md-18 blue'>fiber_new</i></td><td>"+obj[c].inbox.sender+"</td><td>"+obj[c].inbox.subject+"</td><td>"+obj[c].inbox.times.split(".")[0]+"</td><td onclick='reply(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>reply</i></td><td onclick='deleteMail(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>delete</i></td></tr>";
      }else if(obj[c].inbox.status == 1){
        mess+="<tr><td></td><td>"+obj[c].inbox.sender+"</td><td>"+obj[c].inbox.subject+"</td><td>"+obj[c].inbox.times.split(".")[0]+"</td><td onclick='reply(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>reply</i></td><td onclick='deleteMail(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>delete</i></td></tr>";
      }
    }
    mess += "</table>";
    document.getElementById('inbox').innerHTML = mess;
  }
}

function reply(r){
  row = getRow(r);
  var mailInfo = new Array();
  var sender,msg,receiver,time = "";
  for(var i=0;i<mails.length;i++){
    if(mails[i].inbox.times.split(".")[0] == InfobyRow1(row)[3]){
      sender = mails[i].inbox.sender;
      msg = mails[i].inbox.message;
      receiver = mails[i].inbox.receiver;
      time = mails[i].inbox.times;
    }
  }
  var replyText = "\n\n-------------------------\nReplyTo:"+sender+"\nFrom: "+receiver+"\nTime: "+InfobyRow1(row)[2]+"\nContent: "+msg;
  var content = "<input type='submit' value='Back' name='back' onclick='cancelReply()'><h1>"+InfobyRow1(row)[1]+"</h1>From: "+sender+"</br>To: "+receiver+"</br>Time: "+InfobyRow1(row)[3]+"</br>Content: <h5>"+msg+"</h5>";
  content +="<div><form action='php/contact.php' method='post' name='myForm'><input type='hidden' name='receiver' value='"+sender+"'><input type='hidden' value='ReplyTo: "+msg+"' name='subject'>"
  +"<textarea rows='10' type='text' name='message' id='replyText'>"+replyText+"</textarea>"
  +"<input type='submit' value='Send' name='sendMail'></form></div>"
  var replybox = document.getElementById('replyMail');
  replybox.style.display = "block";
  document.getElementById('replyContent').innerHTML = content;
  xmlHttp = GetXmlHttpObject();
  if (xmlHttp==null)
 {
 alert ("Browser does not support HTTP Request");
 return 0;
 }
 var url='php/contact.php';
 var params = "";
 params += "changeStatus=1&sender="+sender+"&receiver="+receiver+"&times="+time;
 xmlHttp.open("POST",url,true);
 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 xmlHttp.onreadystatechange=stateChangedforChangeStatus;
 xmlHttp.send(params);
}

function stateChangedforChangeStatus(){
  if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete"){
      inbox();
   }
}

function cancelReply(){
  var replybox = document.getElementById('replyMail');
  replybox.style.display = "none";
  mailboxInitial();
}

function deleteMail(r){
  row = getRow(r);
  var arr = new Array();
  arr = InfobyRow1(row);
  if(confirm("Are you sure to delete this email?")){
    if(selectName == "inbox"){
      document.getElementById('tableForInbox').deleteRow(row);
      var sen,rec,time = "";
      for(var i=0;i<mails.length;i++){
        if(mails[i].inbox.times.split(".")[0] == arr[3] && mails[i].inbox.sender == arr[1]){
          sen = mails[i].inbox.sender;
          rec = mails[i].inbox.receiver;
          time = mails[i].inbox.times;
        }
      }
    }else if(selectName == "sentmail"){
      document.getElementById('tableForSentMail').deleteRow(row);
      var sen,rec,time = "";
      for(var i=0;i<mails.length;i++){
        if(mails[i].sent.times.split(".")[0] == arr[2]){
          sen = mails[i].sent.sender;
          rec = mails[i].sent.receiver;
          time = mails[i].sent.times;
        }
      }
    }else if(selectName == "draft"){
    document.getElementById('tableForDraft').deleteRow(row);
    var sen,rec,time = "";
    for(var i=0;i<mails.length;i++){
      if(mails[i].draft.times.split(".")[0] == arr[2]){
        sen = mails[i].draft.sender;
        rec = mails[i].draft.receiver;
        time = mails[i].draft.times;
      }
    }
    }
    deleteEmail(sen,rec,time);
  }
}

function deleteEmail(sen,rec,time){
  xmlHttp = GetXmlHttpObject();
if (xmlHttp==null)
 {
 alert ("Browser does not support HTTP Request");
 return 0;
 }
 var url='php/contact.php';
 var params = "";
 params += "deleteMail=1&sender="+sen+"&receiver="+rec+"&times="+time;
 xmlHttp.open("POST",url,true);
 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 xmlHttp.onreadystatechange=stateChangedforDelMail;
 xmlHttp.send(params);
}

function stateChangedforDelMail(){
if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete"){
  alert(xmlHttp.responseText);
  mailboxInitial();
 }
}

function sentMail(){
  xmlHttp = GetXmlHttpObject();
if (xmlHttp==null)
 {
 alert ("Browser does not support HTTP Request");
 return 0;
 }
 var url='php/contact.php';
 var params = "";
 params += "sentmail=1";
 xmlHttp.open("POST",url,true);
 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 xmlHttp.onreadystatechange=stateChangedforSentMail;
 xmlHttp.send(params);
}

function stateChangedforSentMail(){
if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete"){
  var str=xmlHttp.responseText;
  var obj = eval('(' + str + ')');
  mails = obj;
  var mess = "<table id='tableForSentMail'>";
  if(obj.length == 0){
    mess+="<tr><td>No Sent Mails</td></tr>";
  }
  for(var c = 0;c<obj.length;c++){
      mess+="<tr><td>To:"+obj[c].sent.receiver+"</td><td>"+obj[c].sent.subject+"</td><td>"+obj[c].sent.times.split(".")[0]+"</td><td onclick='view(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>zoom_in</i></td><td onclick='deleteMail(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>delete</i></td></tr>";
  }
  mess += "</table>";
    document.getElementById('sentmail').innerHTML = mess;
  }
}

var recID;
function view(r){
  row = getRow(r);
  var mailInfo = new Array();
  var sender,msg,receiver = "";
  for(var i=0;i<mails.length;i++){
    if(mails[i].sent.times.split(".")[0] == InfobyRow1(row)[2]){
      sender = mails[i].sent.sender;
      msg = mails[i].sent.message;
      receiver = mails[i].sent.receiver;
    }
  }
  var content = "<input type='submit' value='Back' name='back' onclick='cancelReply()'><h1>"+InfobyRow1(row)[1]+"</h1>From: "+sender+"</br>To: "+receiver+"</br>Time: "+InfobyRow1(row)[2]+"</br>Content: <h5>"+msg+"</h5>";
  content += "<input type='submit' value='Send Another Mail' onclick='sendMore()'>";
  recID = receiver;
  var viewBox = document.getElementById('replyMail');
  viewBox.style.display = "block";
  document.getElementById('replyContent').innerHTML = content;
}

function sendMore(rec){
  var content ="<div><input type='submit' value='Cancel' name='back' onclick='cancelReply()'><form action='php/contact.php' method='post' name='myForm'><label for='recID'>To</label><input type='text' name='receiver' value='"+recID+"'><label for='subj'>Subject</label><input type='text' value='' name='subject'>"
  +"<input type='hidden' name='times' value=''>"
  +"<label for='msg'>Message</label><textarea rows='10' type='text' name='message'></textarea>"
  +"<input type='submit' value='Send' name='sendMail'><input type='submit' value='Save' name='updateDraft' ></form></div>";
  document.getElementById('replyContent').innerHTML = content;
}

function draft(){
  xmlHttp = GetXmlHttpObject();
if (xmlHttp==null)
 {
 alert ("Browser does not support HTTP Request");
 return 0;
 }
 var url='php/contact.php';
 var params = "";
 params += "draft=1";
 xmlHttp.open("POST",url,true);
 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 xmlHttp.onreadystatechange=stateChangedforDraft;
 xmlHttp.send(params);
}

function stateChangedforDraft(){
if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete"){
  var str=xmlHttp.responseText;
  var obj = eval('(' + str + ')');
  mails = obj;
  var mess = "<table id='tableForDraft'>";
  if(obj.length == 0){
    mess+="<tr><td>No Drafts</td></tr>";
  }
  for(var c = 0;c<obj.length;c++){
      mess+="<tr><td>To:"+obj[c].draft.receiver+"</td><td>"+obj[c].draft.subject+"</td><td>"+obj[c].draft.times.split(".")[0]+"</td><td onclick='rewrite(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>refresh</i></td><td onclick='deleteMail(this)'><i style='cursor:pointer' class='material-icons md-18 blue'>delete</i></td></tr>";
  }
  mess += "</table>";
    document.getElementById('draft').innerHTML = mess;
  }
}

function rewrite(r){
  row = getRow(r);
  var mailInfo = new Array();
  var sender,msg,receiver,time = "";
  for(var i=0;i<mails.length;i++){
    if(mails[i].draft.times.split(".")[0] == InfobyRow1(row)[2]){
      sender = mails[i].draft.sender;
      msg = mails[i].draft.message;
      receiver = mails[i].draft.receiver;
      time = mails[i].draft.times;
    }
  }
  var content ="<div><input type='submit' value='Back' name='back' onclick='cancelReply()'><form action='php/contact.php' method='post' name='myForm'><label for='recID'>To</label><input type='text' name='receiver' value='"+receiver+"'><label for='subj'>Subject</label><input type='text' value='"+InfobyRow1(row)[1]+"' name='subject'>"
  +"<input type='hidden' name='times' value='"+time+"'>"
  +"<label for='msg'>Message</label><textarea rows='10' type='text' name='message'>"+msg+"</textarea>"
  +"<input type='submit' value='Send' name='sendDraft'><input type='submit' value='Save' name='updateDraft' ></form></div>";
  var replybox = document.getElementById('replyMail');
  replybox.style.display = "block";
  document.getElementById('replyContent').innerHTML = content;
}

function mailboxInitial(){
  xmlHttp = GetXmlHttpObject();
if (xmlHttp==null)
 {
 alert ("Browser does not support HTTP Request");
 return 0;
 }
 var url='php/contact.php';
 var params = "";
 params += "initial=1";
 xmlHttp.open("POST",url,true);
 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 xmlHttp.onreadystatechange=stateChangedforInitial;
 xmlHttp.send(params);
}

function stateChangedforInitial(){
  if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete"){
    var str=xmlHttp.responseText;
    var obj = eval('(' + str + ')');
    var inbox = obj[0]["inbox"]["COUNT(*)"];
    var draft = obj[1]["draft"]["COUNT(*)"];
    if(inbox != 0){
      document.getElementById("inboxInitial").innerText = "("+inbox+")";
    }else{
      document.getElementById("inboxInitial").innerText = "";
    }
    if(draft != 0){
      document.getElementById("draftInitial").innerText = "("+draft+")";
    }else{
      document.getElementById("draftInitial").innerText = "";
    }
  }
}

function resetForm(){
  document.forms["myForm"].reset();
}

document.documentElement.onkeydown=resetTime();
document.documentElement.onclick=resetTime();
