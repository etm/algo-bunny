// Type of name_list: [{id: string, username: string}]
function add_table_head(name_list) {
    const table_head = document.getElementById("scoreboard_head")

    name_list.forEach(function(user) {
        cell = document.createElement('th')
        cell.id = user.id
        cell.innerHTML = user.username
        table_head.appendChild(cell)
    })

    // Adjust button span
    document.getElementById("next_level_button_cell").colSpan = "" + name_list.length;
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

function create_cell_content(data) {
    console.log(data)

    const wrapper = document.createElement('div')
    const timestamp = document.createElement('div')
    const stats = document.createElement('a')
    const show_more_bttn = document.createElement('button')

    timestamp.textContent = data.timestamp
    stats.textContent = data.cisc + "|" + data.ins + "|" + data.steps + "|" + data.cmps
    // stats.href = 
    show_more_bttn.textContent = '...'
    show_more_bttn.className = 'show_more_button'

    wrapper.appendChild(stats)
    wrapper.appendChild(show_more_bttn)
    wrapper.appendChild(timestamp)

    return wrapper
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
            if ('timestamp' in student_data[name])
                cell.appendChild(create_cell_content(student_data[name]))
        }
    }

    // Change level number next to the button
    let next_level_cell = document.getElementById("next_level_cell");
    next_level_cell.innerHTML = "Next level: " + rowCount
}

function add_new_user_column(uid, username) {
    const table_head = document.getElementById("scoreboard_head");
    const rowCount = $("#scoreboard_table tr").length;

    // Add name in table head
    cell = document.createElement('th');
    cell.id = uid;
    cell.innerHTML = username;
    table_head.appendChild(cell);

    // Add cells in rows already displayed
    [...document.querySelectorAll('#scoreboard_table tbody tr')].forEach((row, i) => {
        if (i < rowCount - 2) {
            const cell = document.createElement("td");
            row.appendChild(cell);
        }
    });

    // Change span of button cell
    const colCount = $("#scoreboard_table tr th").length;
    document.getElementById("next_level_button_cell").colSpan = "" + colCount - 1;
}

function update_username(uid, username) {
    let username_cell = document.getElementById(uid)
    if (username_cell)
        username_cell.innerHTML = username
    else
        add_new_user_column(uid, username)
}

function register_events() {
    let source = new EventSource("http://localhost:3000/stream");
    source.addEventListener('username_change', function(event) {
        var data = JSON.parse(event.data)
        console.log('got event!!!', event)
        update_username(data.uid, data.username)
    }, false);
}

$(document).ready(
    async function() {
        // let q = $.parseQuerySimple()
        // let levelurl = q.level ? q.level : ''

        

        $.ajax({
            type: "GET",
            url: "http://localhost:3000/init",
            error: () => { console.log("error") }
            }).then(res => {
            const response = JSON.parse(res)
            console.log(response)
            add_table_head(response.users)
        }).then(() => {
            console.log('table head built')
            register_events()
        })

        const btn_add_row = document.getElementById("btn_add_row")
        btn_add_row.onclick = ((ev)=>{
            insert_next_level()
        })
    }
)


