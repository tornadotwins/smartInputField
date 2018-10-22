# smartInputField
by Efraim Meulenberg

[HOSTED EXAMPLE](http://tornadotwins.com/github/smartInputField)

- Requires jQuery
- 'Slider' requires rangeslider by André Ruffert (http://rangeslider.js.org/)
- 'ColorPicker' requires Iris (http://automattic.github.io/Iris/)

The inputField class creates interactive fields that are useful for realtime editing of css properties
or any other toolbar use. 
Currently an inputField can be a 'size' element (a number input that can differentiate between pixels and percentage),
and a dropdown element. To create a new 'size' input field:


    var sizer = new inputField(
    {
        'container': '#thingyHere',     //jquery reference or jquery search string for the container
        'id': 'editWidth',              //id-name to use (optional)
        'disabled': true,               //start the field off disabled or not (optional)
        'onoff': true,                  //add ability to turn the field on or off (optional)
        'value': '85%',                 //default value (in pixels "90px" or percent "90%") (optional)
        'type': 'size',                 //type of input field ('size', 'slider' or 'dropdown')
        'placeholder': "Width",         //placeholder name (in case no value is specified) (optional)
        'callback': function (value)    //callback function that's called on-change and on enable/disable
        {
            console.log('Size callback says:');
            console.log(value);
        }
    });

   
To create a dropdown menu, use the following:


    var dropdown = new inputField(
    {
        'container': '#droppyHere',     //jquery reference or jquery search string for the container
        'id': 'editAlignment',          //id-name to use (optional)
        'disabled': false,              //start the field off disabled or not (optional)
        'type': 'dropdown',             //type of input field ('size', 'slider' or 'dropdown')
        'onoff': true,                  //add ability to turn the field on or off (optional)
        'options':                      //The <options> (value, label) to add to the dropdown
        {
            'left': "Left",
            'right': "Right",
            'center': "Center"          //callback function that's called on-change and on enable/disable
        },
        'callback': function (value)    
        {
            console.log('dropdown callback says:');
            console.log(value);
        }
    });

To create a range-slider, use the following:

    var slider = new inputField(
    {
        type: 'slider',                 //type of input field ('size', 'slider' or 'dropdown')
        container: '#holder',
        id: 'editRoundCorners',
        disabled: false,
        onoff: true,
        min: 0,                         //minimum value of the range slider
        max: 50,                        //maximum value of the range slider
        value: 5,                       //start value of the range slider
        callback: function(value)
        {
            switch(value)
            {
                console.log('RangeSlider callback says:');
                console.log(value);
            }
        }
    });

To create a color picker, use the following:

    var clrPickr = new inputField(
    {
        type: 'color',
        container: '#clrPickr',
        id: 'colorPickerId',
        disabled: false,
        onoff: true,
        value: '#f7ad0c',
        callback: function(value)
        {
            console.log('ColorPicker callback says:');
            console.log(value);
        }
    });


The following methods can be use to influence the inputField at realtime:


    inputField.getValue()               //return the value of the input field
    inputField.disable()                //disable the input field
    inputField.enable()                 //enable the input field
    inputField.setValue(v, force)       //set the value of the field to v, force(optional) is a bool to let the callback function know or not
    inputField.setErrorMessage(html)    //create an error message underneath the field


TODO: Add support for dynamically added options to the dropdown type

