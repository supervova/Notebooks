$(document).ready(function(){
	myEvent();
});

function myEvent() {
 $('.month td').click(function (event) {
		$(this).toggleClass("selected");
    });
}