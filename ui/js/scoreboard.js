// Inserts the current users
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

// Add a new column for new users
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
            const row_id = row.id
            cell.id = ScoreManager.get_cell_id(row_id, uid).cell_id
            row.appendChild(cell);
        }
    });

    // Change span of button cell
    const colCount = $("#scoreboard_table tr th").length;
    document.getElementById("next_level_button_cell").colSpan = "" + colCount - 1;
}

// Reflect name changes in scoreboard header
function update_username(uid, username) {
    let username_cell = document.getElementById(uid)
    if (username_cell)
        username_cell.innerHTML = username
    else
        add_new_user_column(uid, username)
}

// Listen for events
function register_events(scoreManager, liveStats = false) {
    let source = new EventSource("http://localhost:3000/stream");
    source.addEventListener('username_change', function(event) {
        var data = JSON.parse(event.data)
        update_username(data.uid, data.username)
    }, false);
    if (liveStats) {
        source.addEventListener('new_solution', function(event) {
            var data = JSON.parse(event.data)
            scoreManager.add_new_submission(data)
        }, false)
    }
}

$(document).ready(
    async function() {
        let scoreManager = undefined;
        const today = new Date().toJSON().slice(2,10);
        let q = $.parseQuerySimple();
        let day = q.day ? q.day : today;

        // Ask for current data
        $.ajax({
            type: "GET",
            url: "http://localhost:3000/init/"+day,
            error: () => { console.log("error") }
            }).then(res => {
            const response = JSON.parse(res)
            add_table_head(response.users)
            scoreManager = new ScoreManager(response.levels)
        }).then(() => {
            if (day === today)
                register_events(scoreManager, true)
            register_events(scoreManager)
        })

        // Show hidden levels
        const btn_add_row = document.getElementById("btn_add_row")
        btn_add_row.onclick = ((ev)=>{
            if (scoreManager)
                scoreManager.show_next_levels()
        })
    }
)

