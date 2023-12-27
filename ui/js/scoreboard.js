// Type of name_list: [{id: string, username: string}]
function add_table_head(name_list) {
    const table_head = document.getElementById("scoreboard_head")

    name_list.forEach(function(user) {
        cell = document.createElement('th')
        cell.id = user.id
        cell.innerHTML = user.username
        table_head.appendChild(cell)
    })
}

function insert_next_level() {
    const rowCount = $("#scoreboard_table tr").length;

    $.ajax({
        type: "GET",
        url: "http://localhost:3000/get/level/" + (rowCount - 1),
        error: () => { console.log("error") }
        }).then(res => {
        const response = JSON.parse(res)
        console.log(response)
        if ("students" in response) {
            add_row(response["students"])
        }
    })
}

function rm_row(row_index) {
    return function () {
        document.getElementById("scoreboard_table").deleteRow(row_index);
    }
}

function add_row(student_data) {
    // Find position to insert row at
    const rowCount = $("#scoreboard_table tr").length;
    const colCount = $("#scoreboard_table tr th").length;

    // Get name order in table header
    const ids = Array.from(document.getElementById("scoreboard_head").children)
                    .map((cell) => cell.id)
    console.log(ids)

    let table = document.getElementById("scoreboard_table");
    let row = table.insertRow(rowCount - 1);

    // Create row
    let level_cell = row.insertCell(0);
    // level_cell.innerHTML = '<button class="row_rm_button"> X </button>' +
    //     " New Level!" + (rowCount - 1)
    const cell_text = document.createElement('div')
    cell_text.textContent = " New Level!" + (rowCount - 1)
    const bttn = document.createElement('button')
    bttn.textContent = 'X'
    bttn.className = 'row_rm_button'
    bttn.onclick = rm_row(rowCount - 1)
    level_cell.appendChild(bttn)
    level_cell.appendChild(cell_text)

    for (let i = 1; i <= colCount - 1; i++) {
        let cell = row.insertCell(i);
        // Fill cells we have data about
        let name = ids[i]
        if (name in student_data) {
            cell.textContent = JSON.stringify(student_data[name]);
        }
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
            console.log(response)
            add_table_head(response.users)
        })

        const btn_add_row = document.getElementById("btn_add_row")
        btn_add_row.onclick = ((ev)=>{
            insert_next_level()
        })
    }
)


