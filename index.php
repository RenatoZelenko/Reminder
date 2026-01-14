<?php
require "db.php";

/* Dodajanje opravila */
if (isset($_POST['add'])) {
    $text = $_POST['task_text'];
    $datetime = $_POST['task_datetime'];

    $stmt = $conn->prepare("INSERT INTO tasks (task_text, task_datetime) 
    VALUES (?, ?)");
    $stmt->bind_param("ss", $text, $datetime);
    $stmt->execute();

    header("Location: index.php");
    exit;
}

/* Gumb dokončaj */
if (isset($_GET['toggle'])) {
    $id = (int)$_GET['toggle'];
    $conn->query("UPDATE tasks 
                  SET status = IF(status='due','completed','due') 
                  WHERE id=$id");
    header("Location: index.php");
    exit;
}

/* Brisanje opravila */
if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    $conn->query("DELETE FROM tasks WHERE id=$id");
    header("Location: index.php");
    exit;
}

$result = $conn->query("SELECT * FROM tasks ORDER BY task_datetime ASC");
?>
<!DOCTYPE html>
<html>

<head>
    <title>Simple Reminder</title>
    <link rel="stylesheet" href="style.css">
    <style>
        h1{
            text-align: center;
        }

        body { 
            font-family: Arial; 
            margin: 40px; 
        }

        input, button{
            padding: 4px 10px;
            font-size: 16px;
            outline: 0;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th, td { 
            padding: 10px; 
            border: 1px solid 
            #ccc; 
        }
        .completed { 
            color: gray; 
            text-decoration: line-through; 
        }
    </style>
</head>

<body>

    <h1>REMINDER</h1>

    <h2>Add Task</h2>
    <form method="POST">
        <input type="text" name="task_text" placeholder="Task description" required>
        <input type="datetime-local" name="task_datetime"
            min="<?= date('Y-m-d\TH:i'); ?>" required>
        <button type="submit" name="add">Add</button>
    </form>


    <h2>Tasks List</h2>
    <table>
        <tr>
            <th>Task</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>

        <?php while ($row = $result->fetch_assoc()): ?>
            <tr>
                <td class="<?= $row['status']; ?>">
                    <?= htmlspecialchars($row['task_text']); ?>
                </td>
                <td><?= date("Y-m-d H:i", strtotime($row['task_datetime'])); ?></td>
                <td><?= ucfirst($row['status']); ?></td>
                <td>
                    <a href="?toggle=<?= $row['id']; ?>">
                        <?= $row['status'] === 
                        'completed' ? 'Uncomplete' : 'Complete'; ?>
                    </a>
                    |
                    <a href="?delete=<?= $row['id']; ?>" 
                        onclick="return confirm('Delete this task?')">
                        Delete
                    </a>
                </td>
            </tr>
        <?php endwhile; ?>

    </table>

</body>
</html>