let val=$("input:checkbox").checked;
if(val=true)
{
    $(".item p").addClass("checked");
}
else
{
    $(".item p").removeClass("checked");
}