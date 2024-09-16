export function formatStatus(status) {
    // Assuming your status values are in lowercase with hyphens
    // Example: in-progress -> In Progress
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const priorities = {
    1: "High",
    2: "Medium",
    3: "Low"
}
export { priorities}