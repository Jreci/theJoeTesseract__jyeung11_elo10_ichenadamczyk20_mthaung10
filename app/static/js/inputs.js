//input stuff (TESTED)
// inputs.left, inputs.right, inputs.up are the inputs to "worry" about
{
    var inputs = {
        left: false,
        right: false,
        up: false,
    };
    
    // WASD, IJKL, arrow keys, and spacebar
    function keydown(e) {
        switch(e.keyCode) {
            case 37: //left
                inputs.left = true;
                break;
            case 65: //a
                inputs.left = true;
                break;
            case 74: //j
                inputs.left = true;
                break;
            case 38: //up
                inputs.up = true;
                break;
            case 87: //w
                inputs.up = true;
                break;
            case 73: //i
                inputs.up = true;
                break;
            case 32: //spacebar
                inputs.up = true;
                break;
            case 39: //right
                inputs.right = true;
                break;
            case 76: //l
                inputs.right = true;
                break;
            case 68: //d
                inputs.right = true;
                break;
        }
    };

    function keyup(e) {
        switch(e.keyCode) {
            case 37: //left
                inputs.left = false;
                break;
            case 65: //a
                inputs.left = false;
                break;
            case 74: //j
                inputs.left = false;
                break;
            case 38: //up
                inputs.up = false;
                break;
            case 87: //w
                inputs.up = false;
                break;
            case 73: //i
                inputs.up = false;
                break;
            case 32: //spacebar
                inputs.up = false;
                break;
            case 39: //right
                inputs.right = false;
                break;
            case 76: //l
                inputs.right = false;
                break;
            case 68: //d
                inputs.right = false;
                break;
        }
    };

    //adding the event listeners
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
}