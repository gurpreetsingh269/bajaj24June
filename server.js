const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/bfhl", (req, res) => {

    const data = req.body.data || [];

    let invalid_entries = [];
    let duplicate_edges = [];

    let graph = {};
    let childParent = {};
    let seenEdges = new Set();

    const regex = /^[A-Z]->[A-Z]$/;

    // Build graph
    for (let edge of data) {

        edge = edge.trim();

        if (!regex.test(edge)) {
            invalid_entries.push(edge);
            continue;
        }

        let [parent, child] = edge.split("->");

        // self loop invalid
        if (parent === child) {
            invalid_entries.push(edge);
            continue;
        }

        // duplicate edge
        if (seenEdges.has(edge)) {

            if (!duplicate_edges.includes(edge))
                duplicate_edges.push(edge);

            continue;
        }

        seenEdges.add(edge);

        // multi-parent case
        if (childParent[child])
            continue;

        childParent[child] = parent;

        if (!graph[parent])
            graph[parent] = [];

        if (!graph[child])
            graph[child] = [];

        graph[parent].push(child);
    }

    let allNodes = Object.keys(graph);
    let childNodes = new Set(Object.keys(childParent));

    let roots = allNodes.filter(node => !childNodes.has(node));

    let hierarchies = [];

    let total_trees = 0;
    let total_cycles = 0;

    let largest_tree_root = "";
    let maxDepth = 0;

    function buildTree(node, visited = new Set()) {

        if (visited.has(node))
            return null;

        visited.add(node);

        let obj = {};

        for (let child of graph[node]) {

            let subtree = buildTree(child, new Set(visited));

            if (subtree === null)
                return null;

            obj[child] = subtree;
        }

        return obj;
    }

    function findDepth(node) {

        if (graph[node].length === 0)
            return 1;

        let depths = graph[node].map(findDepth);

        return 1 + Math.max(...depths);
    }

    // normal trees
    for (let root of roots) {

        let tree = buildTree(root);

        if (tree === null) {

            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });

            total_cycles++;
        }

        else {

            let d = findDepth(root);

            hierarchies.push({
                root,
                tree: {
                    [root]: tree
                },
                depth: d
            });

            total_trees++;

            if (
                d > maxDepth ||
                (d === maxDepth && root < largest_tree_root)
            ) {
                maxDepth = d;
                largest_tree_root = root;
            }
        }
    }

    // pure cycle case
    if (roots.length === 0 && allNodes.length > 0) {

        let root = [...allNodes].sort()[0];

        hierarchies.push({
            root,
            tree: {},
            has_cycle: true
        });

        total_cycles++;
    }

    res.json({
        user_id: "gurpreetsingh_0510",
        email_id: "gurpreet0510.be23@chitkara.edu.in",
        college_roll_number: "2310990510",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
