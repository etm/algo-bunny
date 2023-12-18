function add_table_head(name_list) {
    const table_head = document.getElementById("scoreboard_head")

    name_list.forEach(function(name) {
        cell = document.createElement('th')
        cell.innerHTML = name
        table_head.appendChild(cell)
    })
}

function add_row() {
    // Find position to insert row at
    const rowCount = $("#scoreboard_table tr").length;
    const colCount = $("#scoreboard_table tr th").length;

    let table = document.getElementById("scoreboard_table");
    let row = table.insertRow(rowCount - 1);

    let level_cell = row.insertCell(0);
    level_cell.innerHTML = "New Level!" + (rowCount - 1)
    for (let i = 1; i <= colCount - 1; i++) {
        let cell = row.insertCell(i);
        cell.innerHTML = i;
    }

    // Change level number next to the button
    let next_level_cell = document.getElementById("next_level_cell");
    next_level_cell.innerHTML = "Next level: " + rowCount

}

$(document).ready(
    function() {
        $.ajax({
            type: "GET",
            url: "http://localhost:3000/init",
            error: () => { console.log("error") }
            }).then(res => {
            const response = JSON.parse(res)
            add_table_head(response.names)
        })

        const btn_add_row = document.getElementById("btn_add_row")
        btn_add_row.onclick = ((ev)=>{
            console.log(ev)
            console.log("clicked button!")
            add_row()
        })
    }
)


