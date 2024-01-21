class ScoreManager {
    #hidden_data
    #visible_data

    constructor(initial_data) {
        this.hidden_data = {};
        this.visible_data = {};

        for (const [level_name, students] of Object.entries(initial_data)) {
            this.hidden_data[level_name] = {}
            for (const [uid, level_stats] of Object.entries(students)) {
                this.hidden_data[level_name][uid] = {}
                const unique_solutions = this.filter_solutions(level_stats)

                const added_missing_hearts = unique_solutions.map((elem) => {
                    if(!('heart' in elem))
                        elem['heart'] = false;
                    return elem;
                })

                const sorted_stats = added_missing_hearts.toSorted(this.stats_cmp)
                this.hidden_data[level_name][uid]['best'] = sorted_stats[0]
                this.hidden_data[level_name][uid]['more'] = sorted_stats
            }
        }
    }

    // Removes duplicate stats
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

    // Function used for sorting each user's array of stats
    stats_cmp(stats1, stats2) {
        if (stats2.heart && !stats1.heart)
            return 1
        else if (stats1.heart && !stats2.heart)
            return -1
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

    // Reveals all hidden stats
    show_next_levels() {
        if (Object.keys(this.hidden_data).length === 0)
            return;

        for (const [level, users] of Object.entries(this.hidden_data)) {
            this.add_row(level, users)
            this.visible_data[level] = users;
        }

        this.hidden_data = {}
    }

    // Hides a given level
    rm_row(cell, level_name) {
        const scoremanager = this;

        return function () {
            let row_index = cell.parentNode.rowIndex;
            scoremanager.hidden_data[level_name] = {...scoremanager.visible_data[level_name]};
            document.getElementById("scoreboard_table").deleteRow(row_index);
            scoremanager.visible_data[level_name] = undefined
        }
    }

    // Builds and inserts a level's data for all users
    add_row(level_name, student_data) {
        // Find position to insert row at
        const rowCount = $("#scoreboard_table tr").length;
        const colCount = $("#scoreboard_table tr th").length;
    
        // Get name order in table header
        const ids = Array.from(document.getElementById("scoreboard_head").children)
                        .map((cell) => cell.id)
    
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
            cell.id = ScoreManager.get_cell_id(level_name, name).cell_id;
            if (name in student_data && student_data[name] != []) {
                const stats = student_data[name];
                cell.appendChild(this.create_cell_content(stats, ScoreManager.get_cell_id(level_name, name)));
            }
        }
    }

    // Updated the best score
    update_best(cell, stats) {
        cell.textContent = stats.cisc + "|" + stats.ins + "|" + stats.steps + "|" + stats.cmps
        cell.href = 'game.html?level=' + stats.level_src + '&solution=' + stats.sol_src
    }

    // Inserts newly received stats into the right score list, or ignores it
    // if the same solution has already been submitted before
    add_new_submission(data) {
        const stats = data['stats']
        
        // Already showing data for this level
        if (data['level'] in this.visible_data && this.visible_data[data['level']] !== undefined) {
            // User already has submissions for this level
            if (data['uid'] in this.visible_data[data['level']]) {
                const current_best = this.visible_data[data['level']][data['uid']]['best']
                const other_sols = this.visible_data[data['level']][data['uid']]['more']

                // Check if solution already exists
                const duplicate = other_sols.find(({code}) => code === stats['code'])
                if (duplicate !== undefined)
                    return
                const cell_id = ScoreManager.get_cell_id(data['level'], data['uid'])

                const bubble = document.getElementById(ScoreManager.get_cell_id(data['level'], data['uid'], "_bubble").cell_id)
                const field_best = document.getElementById(ScoreManager.get_cell_id(data['level'], data['uid'], "_best").cell_id)

                // Update stat list
                this.visible_data[data['level']][data['uid']]['more'].push(stats)
                const sorted_stats = this.visible_data[data['level']][data['uid']]['more'].toSorted(this.stats_cmp)
                const new_bubble_children = this.append_stats(undefined, sorted_stats, cell_id)
                bubble.replaceChildren(...new_bubble_children)

                // Update best stats
                if (this.stats_cmp(current_best, stats) > 0) {
                    this.visible_data[data['level']][data['uid']]['best'] = stats
                    this.update_best(field_best, stats)
                }
            } else { // First submission for this level
                this.visible_data[data['level']][data['uid']] = {'best': stats, 'more': [stats]}
                const cell_id = ScoreManager.get_cell_id(data['level'], data['uid'])
                let cell = document.getElementById(cell_id.cell_id)

                // If this is the first submission for today, add the user's column in the scoreboard
                if (!cell) {
                    add_new_user_column(data['uid'], data['username'])
                    cell = document.getElementById(cell_id.cell_id)
                }

                const cell_content = this.create_cell_content(this.visible_data[data['level']][data['uid']], cell_id)
                cell.appendChild(cell_content)
            }
        } else { // Level not yet displayed
            if (!(data['level'] in this.hidden_data))
                this.hidden_data[data['level']] = {}
            if (!(data['uid'] in this.hidden_data[data['level']])) {
                this.hidden_data[data['level']][data['uid']] = {'best': stats, 'more': []}
            }
            const other_sols = this.hidden_data[data['level']][data['uid']]['more']
            // Check if solution already exists
            const duplicate = other_sols.find(({code}) => code === stats['code'])
            if (duplicate !== undefined)
                return
            // Sort only when we need to show the data
            this.hidden_data[data['level']][data['uid']]['more'].push(stats)
        }
    }

    // Changes state of heart on click
    toggle_heart(cell_id, timestamp) {
        // Update heart status in visible_data
        const stats_list = this.visible_data[cell_id.level][cell_id.uid]['more']
        const entry = stats_list.find((stats) => stats.timestamp === timestamp)
        entry.heart = !entry.heart

        // Store change
        const score_file = "scores" + entry['sol_src'].slice("data".length)
        $.ajax({
            type: 'POST',
            url: 'update_heart.php',
            data: { "file": score_file,
                    "json_data": JSON.stringify({"heart": entry.heart})}
          });

        // Sort list again
        const sorted_stats = stats_list.toSorted(this.stats_cmp)
        const field_best = document.getElementById(cell_id.cell_id + "_best")
        this.update_best(field_best, sorted_stats[0])
        const bubble = document.getElementById(cell_id.cell_id + "_bubble")
        const new_bubble_children = this.append_stats(undefined, sorted_stats, cell_id)
        bubble.replaceChildren(...new_bubble_children)

        this.visible_data[cell_id.level][cell_id.uid]['more'] = sorted_stats
        this.visible_data[cell_id.level][cell_id.uid]['best'] = sorted_stats[0]
    }

    // Creates a bubble entry for a set of stats
    stats_to_elem(stats, cell_id) {
        const scoremanager = this;
        const wrapper = document.createElement('div')
        const stats_elem = document.createElement('a')
        const heart = document.createElement('button')
    
        stats_elem.title = stats.timestamp
        stats_elem.textContent = stats.cisc + "|" + stats.ins + "|" + stats.steps + "|" + stats.cmps
        stats_elem.href = 'game.html?level=' + stats.level_src + '&solution=' + stats.sol_src
        stats_elem.id = cell_id.cell_id + "_" + stats.timestamp + "_stats"
    
        heart.className = "heart_bttn"
        heart.textContent = stats.heart ? "\u2665" : "\u2661"
        heart.onclick = () => {
            heart.textContent = heart.textContent === "\u2661" ? "\u2665" : "\u2661";
            scoremanager.toggle_heart(cell_id, stats.timestamp);
        };
        heart.id = cell_id.cell_id + "_" + stats.timestamp + "_heart"
    
        wrapper.appendChild(stats_elem)
        wrapper.appendChild(heart)
    
        return wrapper
    }

    // Creates the stat list entries for the bubble, and if given, inserts them in a container
    append_stats(container, stats, cell_id) {
        let node_list = []
        for (let i=0; i<stats.length; i++) {
            let stats_elem = this.stats_to_elem(stats[i], cell_id);
            if (container)
                container.appendChild(stats_elem);
            node_list.push(stats_elem);
        }
        return node_list;
    }

    // Builds the content of an entire scoreboard cell
    create_cell_content(data, cell_id) {
        const sorted_stats = data['more'].toSorted(this.stats_cmp)
        data['best'] = sorted_stats[0]
        data['more'] = sorted_stats
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
        stats.id = cell_id.cell_id + "_best"
        show_more_bttn.textContent = '\u22EF'
        show_more_bttn.className = 'show_more_button'
        bubble.className = 'bubble'
        if (more_stats)
            this.append_stats(bubble, more_stats, cell_id);
        bubble.hidden = true
        bubble.id = cell_id.cell_id + "_bubble"

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

    // Generates ids for scoreboard components
    static get_cell_id(level_name, uid, suffix="") {
        const id = {
            level: level_name,
            uid: uid,
            cell_id: level_name + "_" + uid + (suffix !== "" ? suffix : "")
        }
        return id;
    }

}
