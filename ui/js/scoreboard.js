class ScoreManager {
    #hidden_data
    #visible_data

    constructor(initial_data) {
        this.hidden_data = {};
        this.visible_data = {};
        console.log(initial_data);

        for (const [level_name, students] of Object.entries(initial_data)) {
            this.hidden_data[level_name] = {}
            for (const [uid, level_stats] of Object.entries(students)) {
                this.hidden_data[level_name][uid] = {}
                const unique_solutions = this.filter_solutions(level_stats)
                const sorted_stats = unique_solutions.toSorted(this.stats_cmp)
                this.hidden_data[level_name][uid]['best'] = sorted_stats[0]
                this.hidden_data[level_name][uid]['more'] = sorted_stats.slice(1)
            }
        }

        console.log(this.hidden_data)
    }

    filter_solutions(stats) {
        const groups = Object.groupBy(stats, ({code}) => code)
        let unique_sols = []
        for (const [_, group] of Object.entries(groups)) {
            if (group.len === 1)
                unique_sols.push(group[0])
            else {
                const sorted_group = group.toSorted(this.stats_cmp)
                unique_sols.push(sorted_group[0])
            }
        }
        return unique_sols
    }

    stats_cmp(stats1, stats2) {
        if (stats1.cisc === stats2.cisc && stats1.ins === stats2.ins &&
            stats1.steps === stats2.steps && stats1.cmps === stats2.cmps)
            return new Date(stats2.timestamp) - new Date(stats1.timestamp)
        else if (stats1.cisc >= stats2.cisc && stats1.ins >= stats2.ins &&
            stats1.steps >= stats2.steps && stats1.cmps >= stats2.cmps)
            return 1
        else if (stats1.cisc <= stats2.cisc && stats1.ins <= stats2.ins &&
            stats1.steps <= stats2.steps <= stats1.cmps <= stats2.cmps)
            return -1
        return new Date(stats2.timestamp) - new Date(stats1.timestamp)
    }

    show_next_levels() {
        if (Object.keys(this.hidden_data).length === 0) {
            console.log("No more submissions");
            return;
        }

        for (const [level, users] of Object.entries(this.hidden_data)) {
            console.log(`${level}: ${users}`);
            this.add_row(level, users)
            this.visible_data[level] = users;
        }

        this.hidden_data = {}
        console.log(this.visible_data)
    }

    rm_row(cell, level_name) {
        const scoremanager = this;

        return function () {
            let row_index = cell.parentNode.rowIndex;
            scoremanager.hidden_data[level_name] = scoremanager.visible_data[level_name];
            document.getElementById("scoreboard_table").deleteRow(row_index);
            scoremanager.visible_data[level_name] = {}
        }
    }

    add_row(level_name, student_data) {
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
        bttn.textContent = '\u2A2F'
        bttn.className = 'row_rm_button'
        bttn.onclick = this.rm_row(level_cell, level_name)
        row.id = level_name
        level_cell.appendChild(bttn)
        level_cell.appendChild(cell_text)
    
        for (let i = 1; i <= colCount - 1; i++) {
            let cell = row.insertCell(i);
            // Fill cells we have data about
            let name = ids[i];
            cell.id = get_cell_id(level_name, name);
            if (name in student_data && student_data[name] != []) {
                const stats = student_data[name];
                cell.appendChild(create_cell_content(stats, get_cell_id(level_name, name)));
            }
        }
    }

    add_new_submission(data) {
        const stats = data['stats']
        
        // Already showing data for this level
        if (data['level'] in this.visible_data) {
            // User already has submissions for this level
            if (data['uid'] in this.visible_data[data['level']]) {
                const current_best = this.visible_data[data['level']][data['uid']]['best']
                const other_sols = this.visible_data[data['level']][data['uid']]['more']
                // Check if solution already exists
                const duplicate = other_sols.concat(current_best).find(({code}) => code === stats['code'])
                if (duplicate !== undefined)
                    return

                const bubble = document.getElementById(get_cell_id(data['level'], data['uid'], "_bubble"))
                const field_best = document.getElementById(get_cell_id(data['level'], data['uid'], "_best"))

                // Check if it's a better solution
                if (this.stats_cmp(current_best, stats) > 0) {
                    this.visible_data[data['level']][data['uid']]['more'].push(current_best)
                    this.visible_data[data['level']][data['uid']]['best'] = stats
                    update_best(field_best, stats)
                    append_stats(bubble, [current_best])
                } else {
                    this.visible_data[data['level']][data['uid']]['more'].push(stats)
                    // Add solution to bubble
                    append_stats(bubble, [data['stats']])
                }
            } else {
                this.visible_data[data['level']][data['uid']] = {'best': stats, 'more': []}
                const cell = document.getElementById(get_cell_id(data['level'], data['uid']))
                const cell_content = create_cell_content(this.visible_data[data['level']][data['uid']],
                                                        get_cell_id(data['level'], data['uid']))
                cell.appendChild(cell_content)
            }
        } else { // Level not yet displayed
            if (!(data['level'] in this.hidden_data))
                this.hidden_data[data['level']] = {}
            if (!(data['uid'] in this.hidden_data[data['level']])) {
                this.hidden_data[data['level']][data['uid']] = {'best': stats, 'more': []}
            } else {
                const current_best = this.hidden_data[data['level']][data['uid']]['best']
                if (this.stats_cmp(current_best, stats) > 0) {
                    this.hidden_data[data['level']][data['uid']]['best'] = stats
                } else {
                    this.hidden_data[data['level']][data['uid']]['more'].push(stats)
                }
            }
        }
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

function append_stats(container, stats) {
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

function update_best(cell, stats) {
    cell.textContent = stats.cisc + "|" + stats.ins + "|" + stats.steps + "|" + stats.cmps
    cell.href = 'game.html?level=' + stats.level_src + '&solution=' + stats.sol_src
}

function create_cell_content(data, cell_id) {
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
    stats.id = cell_id + "_best"
    show_more_bttn.textContent = '\u22EF'
    show_more_bttn.className = 'show_more_button'
    bubble.className = 'bubble'
    if (more_stats)
        append_stats(bubble, more_stats);
    bubble.hidden = true
    bubble.id = cell_id + "_bubble"

    show_more_bttn.onclick = () => {
        if (bubble.childElementCount !== 0) {
            bubble.hidden = !bubble.hidden;
            show_more_bttn.textContent = show_more_bttn.textContent === '\u22EF' ? '\u2A2F' : '\u22EF'
        }
    }

    wrapper.appendChild(stats)
    wrapper.appendChild(show_more_bttn)
    wrapper.appendChild(bubble)
    wrapper.appendChild(timestamp)

    return wrapper
}

function get_cell_id(level_name, uid, suffix="") {
    return level_name + "_" + uid + suffix;
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

function register_events(scoreManager) {
    let source = new EventSource("http://localhost:3000/stream");
    source.addEventListener('username_change', function(event) {
        var data = JSON.parse(event.data)
        console.log('got event!!!', event)
        update_username(data.uid, data.username)
    }, false);
    source.addEventListener('new_solution', function(event) {
        var data = JSON.parse(event.data)
        console.log('got event!!!', event)
        console.log(data)
        scoreManager.add_new_submission(data)
    })
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
            register_events(scoreManager)
        })

        const btn_add_row = document.getElementById("btn_add_row")
        btn_add_row.onclick = ((ev)=>{
            if (scoreManager)
                scoreManager.show_next_levels()
        })
    }
)


