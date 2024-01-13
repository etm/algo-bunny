class ScoreManager {
    #hidden_data

    constructor(initial_data) {
        this.hidden_data = {};
        console.log(initial_data);

        for (const [level_name, students] of Object.entries(initial_data)) {
            this.hidden_data[level_name] = {}
            for (const [uid, level_stats] of Object.entries(students)) {
                this.hidden_data[level_name][uid] = {}
                // TODO: filter duplicate solutions and find best solution
                this.hidden_data[level_name][uid]['best'] = level_stats[0]
                this.hidden_data[level_name][uid]['more'] = level_stats.slice(1)
            }
        }

        console.log(this.hidden_data)
    }

    show_next_levels() {
        if (Object.keys(this.hidden_data).length === 0) {
            console.log("No more submissions");
            return;
        }

        for (const [level, users] of Object.entries(this.hidden_data)) {
            console.log(`${level}: ${users}`);
            add_row(level, users)
        }

        this.hidden_data = {}
    }
}

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

function rm_row(row_index) {
    return function () {
        document.getElementById("scoreboard_table").deleteRow(row_index);
    }
}

function append_stats(container, stats) {
    stats_div = document.createElement('div')
    for (let i=0; i<stats.length; i++) {
        container.appendChild(stats_to_elem(stats[i]))
    }
}

function stats_to_elem(stats) {
    const stats_elem = document.createElement('a')

    stats_elem.textContent = stats.timestamp
    stats_elem.title = stats.cisc + "|" + stats.ins + "|" + stats.steps + "|" + stats.cmps
    stats_elem.href = 'game.html?level=' + stats.level_src + '&solution=' + stats.sol_src
    stats_elem.style.display = "block"

    return stats_elem
}

function create_cell_content(data) {
    console.log(data)
    const best = data['best']
    const more_stats = data['more']

    const wrapper = document.createElement('div')
    const timestamp = document.createElement('div')
    const stats = document.createElement('a')
    const show_more_bttn = document.createElement('button')
    const bubble = document.createElement('div')

    timestamp.textContent = best.timestamp
    stats.textContent = best.cisc + "|" + best.ins + "|" + best.steps + "|" + best.cmps
    stats.href = 'game.html?level=' + best.level_src + '&solution=' + best.sol_src
    show_more_bttn.textContent = '...'
    show_more_bttn.className = 'show_more_button'
    bubble.className = 'bubble'
    if (more_stats)
        append_stats(bubble, more_stats);
    else
        bubble.textContent = "Bubble"
    bubble.hidden = true

    show_more_bttn.onclick = () => {
        bubble.hidden = !bubble.hidden;
        show_more_bttn.textContent = show_more_bttn.textContent === '...' ? 'x' : '...'
    }

    wrapper.appendChild(stats)
    wrapper.appendChild(show_more_bttn)
    wrapper.appendChild(bubble)
    wrapper.appendChild(timestamp)

    return wrapper
}

function add_row(level_name, student_data) {
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
    cell_text.textContent = level_name
    const bttn = document.createElement('button')
    bttn.textContent = 'X'
    bttn.className = 'row_rm_button'
    bttn.onclick = rm_row(rowCount - 1)
    level_cell.id = level_name
    level_cell.appendChild(bttn)
    level_cell.appendChild(cell_text)

    for (let i = 1; i <= colCount - 1; i++) {
        let cell = row.insertCell(i);
        // Fill cells we have data about
        let name = ids[i]
        if (name in student_data && student_data[name] != []) {
            const stats = student_data[name];
            cell.appendChild(create_cell_content(stats));
        }
    }
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
        let scoreManager = undefined

        $.ajax({
            type: "GET",
            url: "http://localhost:3000/init/today",
            error: () => { console.log("error") }
            }).then(res => {
            const response = JSON.parse(res)
            console.log(response)
            add_table_head(response.users)
            scoreManager = new ScoreManager(response.levels)
        }).then(() => {
            console.log('table head built')
            register_events()
        })

        const btn_add_row = document.getElementById("btn_add_row")
        btn_add_row.onclick = ((ev)=>{
            if (scoreManager)
                scoreManager.show_next_levels()
        })
    }
)


