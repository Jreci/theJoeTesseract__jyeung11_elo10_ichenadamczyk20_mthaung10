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
                e.preventDefault();
                inputs.left = true;
                break;
            case 65: //a
                e.preventDefault();
                inputs.left = true;
                break;
            case 74: //j
                e.preventDefault();
                inputs.left = true;
                break;
            case 38: //up
                e.preventDefault();
                inputs.up = true;
                break;
            case 87: //w
                e.preventDefault();
                inputs.up = true;
                break;
            case 73: //i
                e.preventDefault();
                inputs.up = true;
                break;
            case 32: //spacebar
                e.preventDefault();
                inputs.up = true;
                break;
            case 39: //right
                e.preventDefault();
                inputs.right = true;
                break;
            case 76: //l
                e.preventDefault();
                inputs.right = true;
                break;
            case 68: //d
                e.preventDefault();
                inputs.right = true;
                break;
        }
    };

    function keyup(e) {
        switch(e.keyCode) {
            case 37: //left
                e.preventDefault();
                inputs.left = false;
                break;
            case 65: //a
                e.preventDefault();
                inputs.left = false;
                break;
            case 74: //j
                e.preventDefault();
                inputs.left = false;
                break;
            case 38: //up
                e.preventDefault();
                inputs.up = false;
                break;
            case 87: //w
                e.preventDefault();
                inputs.up = false;
                break;
            case 73: //i
                e.preventDefault();
                inputs.up = false;
                break;
            case 32: //spacebar
                e.preventDefault();
                inputs.up = false;
                break;
            case 39: //right
                e.preventDefault();
                inputs.right = false;
                break;
            case 76: //l
                e.preventDefault();
                inputs.right = false;
                break;
            case 68: //d
                e.preventDefault();
                inputs.right = false;
                break;
        }
    };

    //adding the event listeners
    document.querySelector("canvas").addEventListener("keydown", keydown);
    document.querySelector("canvas").addEventListener("keyup", keyup);
}
