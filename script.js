const addTask = document.getElementById('add-task');
addTask.addEventListener('click',()=>{
    document.getElementById("form").style.display = "block";
})

function Task(taskName,Category,Priority){
    this.taskName = taskName;
    this.Category = Category;
    this.Priority = Priority;
}

const tableRows = document.querySelectorAll("tbody tr");
const btnAdd= document.getElementById('add');
btnAdd.addEventListener('click',(event)=>{
    event.preventDefault();
    const formData = new FormData(form);
    if(validate(formData))
        {        
            const task = new Task(formData.get('task-name'),formData.get('category'),formData.get('priority'));
            console.log(task.taskName +"  "+task.Category +"  " + task.Priority);
           

        }

})

function validate(formData)
{
    if( 
          formData.get('task-name') === ""
       || formData.get('category') === ""
       || formData.get('priority') === ""
       
    )
    {
        window.alert('please fill all the required filed');
        return false;
    }
    return true;
}
 