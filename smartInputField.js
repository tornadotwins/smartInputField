/*
# smartInputField
by Efraim Meulenberg

[HOSTED EXAMPLE](http://tornadotwins.com/github/smartInputField)

Requires jQuery
'Slider' requires rangeslider by André Ruffert (http://rangeslider.js.org/)
'ColorPicker' requires Iris (http://automattic.github.io/Iris/)

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

*/

function inputField (options = {})
{
    this.constructor = function(options)
    {
        if(options.container)   {   this.setContainer(options.container);       }
        if(options.placeholder) {   this.setPlaceHolder(options.placeholder);   }
        if(options.type)        {   this.setType(options.type);                 }
        if(options.options)     {   this.addDropdownOptions(options.options);   }
        if(options.id)          {   this.setId(options.id);                     }
        if(options.name)        {   this.setName(options.name);                 }
        if(typeof options.disabled !== "undefined")     {   this.setDisabled(options.disabled);         }
        if(options.callback)                            {   this.setCallback(options.callback);         }
        if(typeof options.value !== 'undefined')        {   this.setStartValue(options.value);          }
        if(options.onoff)                               {   this.setOnOff(options.onoff);               }
        if(typeof options.min !== 'undefined')          {   this.setMin(options.min);                   }
        if(typeof options.max !== 'undefined')          {   this.setMax(options.max);                   }
        if(typeof options.step !== 'undefined')         {   this.setStep(options.step);                 }

        //start it up!
        this.create();
    };

    this.onoff = false;
    this.setOnOff = function(v)
    {
        this.onoff = v;
    };
    this.ison = true;
    this.createOnOff = function()
    {
        //Create the checkbox container
        var c = $('<div/>');
        c.addClass('checkbox');

        //Create the checkbox object
        var o = $('<input/>');
        o.attr('type', 'checkbox');
        o.attr('id', this.id+"_onoff");
        if(this.ison && (!this.disabled))
        {
            o.prop('checked', true);
        }
        else
        {
            o.prop('checked', false);
        }
        var that = this;
        o.off('change').on('change', function()
        {
            if($(this).prop('checked'))
            {
                that.turnOff();
            }
            else
            {
                that.turnOn();
            }
        });

        //Create the checkbox label
        var l = $('<label/>');
        l.attr('for', this.id+"_onoff");

        //Put the label and the checkbox in the container
        c.append(o);
        c.append(l);

        return c;
    };
    this.turnOn = function()
    {
        this.disable(true);
        this.ison = true;
    };
    this.turnOff = function()
    {
        this.enable(true);
        this.ison = false;
    };

    this.startValue = null;
    this.setStartValue = function (v)
    {
        this.startValue = v;
    }

    this.callback = null;
    this.setCallback = function(a)
    {
        this.callback = a;
    }

    //HTML id attribute
    this.id = null;
    this.setId = function (id)
    {
        this.id = id;
    };

    //HTML name attribute
    this.name = null;
    this.setName = function (name)
    {
        this.name = name;
    };

    //HTML disabled attribute
    this.disabled = false;
    this.setDisabled = function (d)
    {
        this.disabled = d;
    };

    this.getValue = function()
    {
        switch(this.type)
        {
            case "size":
                //if the box is empty, return null
                if(!this.element.val())
                {
                    return null;
                }

                //return the value, either in percent or in pixels
                if(this.valueInPercent)
                {
                    return this.element.val()+"%";
                }
                else
                {
                    return this.element.val()+"px";
                }
            break;

            case "slider":

                //return the value, either in percent or in pixels
                if(this.valueInPercent)
                {
                    return this.element.val()+"%";
                }
                else
                {
                    return this.element.val()+"px";
                }
            break;

            case "dropdown":
                //return the value of the selected item
                return $("#"+this.id+" option:selected").val();
            break;

            //used by 'text' type, 'color' type, etc
            default:
                return this.element.val();
            break;
        }
    };

    //Set the value of the element
    this.setValue = function(v, callback=true)
    {
        switch(this.type)
        {
            
            case 'slider':
                var hasPx = v.indexOf('px') >= 0;
                var hasPc = v.indexOf('%')  >= 0;

                //force value to an integer
                v = parseInt(v, 10);
                
                //console.log('updating slider value: '+v);
                this.element.val(v).change();
                this.element.rangeslider('update');

                if(hasPc)
                {
                    this.setSizeToPercent(v);
                }
                else
                {
                    this.setSizeToPixels(v);
                }
            break;
            
            
            case "size":
                var hasPx = v.indexOf('px') >= 0;
                var hasPc = v.indexOf('%')  >= 0;

                //force value to an integer
                v = parseInt(v, 10);
                
                this.element.val(v);

                if(hasPc)
                {
                    this.setSizeToPercent(v);
                }
                else
                {
                    this.setSizeToPixels(v);
                }
            break;

            case "dropdown":
                //if the option exist, this will select it
                this.element.val(v);

                if(this.element.val() !== v)
                {
                    console.warn('Setting dropdown value failed: '+v);
                }
            break;

            //used by type=text, type=color etc
            default:
                this.element.val(v);
            break;
        }

        if(this.callback && this.created && callback)
        {
            this.callback(this.getValue());
        }
    };

    this.valueInPercent = false;
    this.valueInPixels  = false;
    this.setSizeToPercent = function (v=null)
    {
        if(this.created)
        {
            //If we're not given a value, use the value already there
            //This way, we can use this function from setValue as well as button click events
            if(!v)
            {
                v = this.getValue();
            }

            //Set errrrr'thing to percentage
            this.container.find('#'+this.id+"_pc").removeClass('subBtn_off');
            this.container.find('#'+this.id+"_pc").addClass('subBtn_on');

            this.container.find('#'+this.id+"_px").removeClass('subBtn_on');
            this.container.find('#'+this.id+"_px").addClass('subBtn_off');

            this.valueInPercent = true;
            this.valueInPixels  = false;   
        }
    };
    this.setSizeToPixels = function (v)
    {
        if(this.created)
        {
            //If we're not given a value, use the value already there
            //This way, we can use this function from setValue as well as button click events
            if(!v)
            {
                v = this.getValue();
            }

            //Set errrrr'thing to pixels
            this.container.find('#'+this.id+"_pc").removeClass('subBtn_on');
            this.container.find('#'+this.id+"_pc").addClass('subBtn_off');

            this.container.find('#'+this.id+"_px").removeClass('subBtn_off');
            this.container.find('#'+this.id+"_px").addClass('subBtn_on');

            this.valueInPercent = false;
            this.valueInPixels  = true;
        }
    };

    /**
     * What type of input is this?
     * The type has to be set before this.create() is called.
     * By default, it's a text input field.
    */
    this.type = "text";
    this.setType = function(t)
    {
        switch (t)
        {
            case "text":
                this.type = "text";
            break;

            case "size":
                this.type = "size";
            break;

            case "dropdown":
                this.type = "dropdown";
            break;

            case "slider":
                this.type = "slider";
            break;

            case 'color':
                this.type = 'color';
            break;

            case 'colour':
                this.type = 'color';
            break;
        }
    };
    
    this.placeholder = null;
    this.setPlaceHolder = function(v)
    {
        this.placeholder = v;
    };
    
    //True when the DOM element has been created, false before
    this.created = false;
    //jQuery reference to the main element after creation
    this.element = null;
    //jQuery reference to this element's error container
    this.errorElement = null;
    
    /**
     * create() starts off the creation process. Called by the constructor
    */
    this.create = function()
    {
        //Don't create anything without a specified container
        if(!this.container) { return; }
        //Don't create twice
        if(this.created)    { return; }

        switch (this.type)
        {
            case "dropdown":
                this.createDropdown();
            break;

            case "size":
                this.createSize();
            break;

            case "slider":
                this.createSlider();
            break;

            case "text":
                this.createText();
            break;

            case "color":
                this.createColorPicker();
            break;
        }
    };

    //holds options for a dropdown element
    this.options = {};
    this.addDropdownOptions = function(options)
    {
        this.options = options;
    };
    //private function that adds options to a $('<select/>')
    this.addOptionsToSelect = function(select)
    {
        $.each(this.options, function(value, name) 
        {
            select.append( $("<option value='"+value+"'/>").text(name) );
        });

        return select;        
    };

    /**
     * Creates a Dropdown element
    */
    this.createDropdown = function()
    {
        //Don't create anything without a specified container
        if(!this.container) { return; }
        //Don't create twice
        if(this.created)    { return; }

        var select = $('<select/>');
        if(this.name)       { select.attr('name', this.name);       }
        if(this.disabled)   { select.prop('disabled', 'disabled');  }
        if(!this.id)
        {
            this.id = this.createRandomString();
        }
        select.attr('id', this.id);

        if(! ($.isEmptyObject(this.options)) )
        {
            select = this.addOptionsToSelect(select);
        }

        if(this.onoff)
        {
            select.css('width', 'calc(100% - 41px)');
            select.css('float', 'left');
        }
        else
        {
            select.css('width', 'calc(100% - 6px)');
        }
        select.css('margin', '3px');

        //check if we need an on/off switch
        if(this.onoff)
        {
            var oo = this.createOnOff();
            this.container.append(oo);
        }
        
        this.container.append(select);

        //<div class="error_msg" data-linked-to="f_align">Bla</div>
        this.container.append('<div class="error_msg" id="error_'+this.id+'" />')

        this.element = $('#'+this.id);
        this.errorElement = $('#error_'+this.id);

        var that = this;

        //make sure any specified callback gets called if we're given one
        if(this.callback)
        {
            $(document).on('change','#'+this.id,function()
            {
                that.callback(that.getValue());
            });
        }

        this.created = true;
    };

    /**
     * Displays an error message for this element. Only works if creation is done.
    */
    this.setErrorMessage = function(html)
    {
        if(this.created)
        {
            this.errorElement.html(html);
        }
    };

    this.rangeMin = 0;
    this.setMin = function(min)
    {
        this.rangeMin = Number(min);
    };
    this.rangeMax = 50;
    this.setMax = function(max)
    {
        this.rangeMax = Number(max);
    };
    this.rangeStep = 1;
    this.setStep = function(step)
    {
        this.rangeStep = Number(step);
    };

    /**
     * Creates a range 'slider' element that works in all major browsers & mobile 
    */
    this.createSlider = function()
    {
        /* 
        <div class="checkbox">
            <input type="checkbox" id="slidy_onoff">
            <label for="slidy_onoff"></label>
        </div>
        <div class="slider-container">
            <div class="slider-aligner">
                <input
                    id="slidy"
                    type="range"
                    min="0"                    
                    max="50"                 
                    step="1"                   
                    value="0"                 
                    data-orientation="horizontal"
                >
            </div>
        </div> 
        <div class="slider-pxpc-container">
            <button class="inputSubButton subBtn_off" id="slidy_px">px</button>
            <button class="inputSubButton subBtn_on" id="slidy_pc">%</button>
        </div>
        */
        
        //Don't create anything without a specified container
        if(!this.container) { return; }
        //Don't create twice
        if(this.created)    { return; }

        var input = $('<input />');

        if(this.name)       { input.attr('name', this.name);                }
        if(this.disabled)   { input.prop('disabled', 'disabled');           }
        if(!this.id)
        {
            this.id = this.createRandomString();
        }
        input.attr('id', this.id);
        input.attr('type', 'range');
        input.attr('data-orientation', 'horizontal');

        //min and max are set now, but startvalue (value) is set after creation
        input.attr('min', this.rangeMin);
        input.attr('max', this.rangeMax);
        input.attr('step', this.rangeStep);

        slider_aligner = $('<div/>');
        slider_aligner.addClass('slider-aligner');

        slider_container = $('<div/>');
        slider_container.addClass('slider-container');

        if(this.onoff)
        {
            slider_container.css('width', 'calc(100% - 129px)');
        }
        else
        {
            slider_container.css('width', 'calc(100% - 89px)');
        }

        slider_aligner.append(input);
        slider_container.append(slider_aligner);

        this.container.append(slider_container);


        var that = this;

        var button_container = $('<div/>');
        button_container.addClass('slider-pxpc-container');

        //percent button
        var pcBtn = $('<button/>');
        pcBtn.addClass('inputSubButton');
        pcBtn.addClass('subBtn_off');
        pcBtn.attr('id', this.id+"_pc");
        pcBtn.text('%');
        pcBtn.off('click').on('click', function ()
        {
            if(that.disabled) { return; }
            that.setSizeToPercent();
            if(that.callback) 
            {
                that.callback(that.getValue());
            }
        });

        //pixel button
        var pxBtn = $('<button/>');
        pxBtn.addClass('inputSubButton');
        pxBtn.addClass('subBtn_on');    //use pixels by default
        pxBtn.attr('id', this.id+"_px");
        pxBtn.text('px');
        pxBtn.off('click').on('click', function ()
        {
            if(that.disabled) { return; }
            that.setSizeToPixels();
            if(that.callback) 
            {
                that.callback(that.getValue());
            }
        });

        //use pixels by default
        this.valueInPixels = true;

        button_container.append(pcBtn);
        button_container.append(pxBtn);
        this.container.append(button_container);


        //check if we need an on/off switch
        if(this.onoff)
        {
            var oo = this.createOnOff();
            this.container.prepend(oo);
        }
        
        //add an error message container
        this.container.append('<div class="error_msg" id="error_'+this.id+'" />')
        this.errorElement = $('#error_'+this.id);

        //keep a reference to the element in memory
        this.element = $('#'+this.id);

        //activate the element as range
        this.element.rangeslider(
        {
            polyfill: false,
            onInit: function () 
            {
                var $handle = $('.rangeslider__handle', this.$range);
                that.updateRangeHandle($handle[0], this.value);
            } 
        });

        this.element.on('input', function (e) 
        {
            var $handle = $('.rangeslider__handle', e.target.nextSibling);
            that.updateRangeHandle($handle[0], this.value);
        });

        //make sure any specified callback gets called if we're given one
        if(this.callback)
        {
            $(document).on('change','#'+this.id,function()
            {
                that.callback(that.getValue());
            });
        }

        //let all other functions know we're past the creation phase
        this.created = true;

        //if there was a start value, apply it (now that creation is done)
        if(this.startValue)
        {
            this.setValue(this.startValue, false);
        }

        if(this.disabled)
        {
            this.disable();
        }


    };

    /**
     * Updates the number on the Range Slider's handle when it's being used
    */
    this.updateRangeHandle = function (el, val) 
    {
        el.textContent = val;
    };

    this.cpVisible = false; //color picker visible?
    this.createColorPicker = function()
    {
        
        //Don't create anything without a specified container
        if(!this.container) { return; }
        //Don't create twice
        if(this.created)    { return; }

        /*
        //given this.container
        <div id="colorPicker">
            
            <div id="00_container" class="colorContainer">
                <div id="00_colorShower" class="colorShower">
                    <div id="00_arrow" class="colorArrowDown"></div>
                </div>

                //this.element
                <input type="text" id='00' value="#ffa500" />    
            </div>
            <div id="00_colorPickerContainer" class="colorPickerContainer">
            </div>
        </div>
        */
        
        var input = $('<input />');
        if(this.name)       { input.attr('name', this.name);                }
        if(this.disabled)   { input.prop('disabled', 'disabled');           }
        if(this.placeholder){ input.attr('placeholder', this.placeholder);  }
        if(!this.id)
        {
            this.id = this.createRandomString();
        }

        input.attr('id', this.id);
        input.attr('type', 'text');
        input.val(this.startValue);

        //create colorContainer
        var cc = $('<div/>');
        cc.attr('id', this.id+"_container");
        cc.addClass('colorContainer');

        //make room for an on/off checkbox if we need it
        if(this.onoff)
        {
            cc.css('margin-left', '38px');
        }

        //create colorShower
        var cs = $('<div/>');
        cs.attr('id', this.id+"_colorShower");
        cs.addClass('colorShower');

        //create dropdown arrow
        var ca = $('<div/>');
        ca.attr('id', this.id+'_arrow');
        ca.addClass('colorArrowDown');

        //create the floating container that holds the hidden colorpicker
        var cpc = $('<div/>');
        cpc.attr('id', this.id+"_colorPickerContainer");
        cpc.addClass('colorPickerContainer');

        //make room for an on/off checkbox if we need it
        if(this.onoff)
        {
            cpc.css('margin-left', '38px');
        }

        cs.append(ca);
        cc.append(cs);
        cc.append(input);

        //check if we need an on/off switch
        if(this.onoff)
        {
            var oo = this.createOnOff();
            this.container.append(oo);
        }
        
        //add it to the DOM
        this.container.append(cc);
        this.container.append(cpc);

        //add an error message container
        this.container.append('<div class="error_msg" id="error_'+this.id+'" />')
        this.errorElement = $('#error_'+this.id);

        this.element = $('#'+this.id);

        var that = this;

        this.element.iris(
        {
            //don't hide just yet
            hide: false,
            target: $('#'+that.id+'_colorPickerContainer'),
            color: that.element.val(),
            //callback function
            change: function(event, ui) 
            {
                // event = standard jQuery event, produced by whichever control was changed.
                // ui = standard jQuery UI object, with a color member containing a Color.js object

                // change the color-shower's color
                $("#"+that.id+"_colorShower").css( 'background-color', ui.color.toString());

                if(that.callback)
                {
                    that.callback(ui.color.toString());
                }
            }
        });

        //INIT: Now hide it, so that we can use toggle from there on
        this.element.iris('hide');
        $("#"+this.id+"_colorShower").css( 'background-color', this.element.val() );

        this.cpVisible = false;
        //Toggle the colorpicker plugin when we click on the colorshower
        $('#'+this.id+'_colorShower').off('click').on('click', function () 
        {
            if(that.disabled) { return; }

            if(that.cpVisible)
            {
                that.element.iris('hide');
                $('#'+that.id+'_arrow').removeClass('colorArrowUp').addClass('colorArrowDown');
                that.cpVisible = false;
            }
            else
            {
                that.element.iris('show');
                $('#'+that.id+'_arrow').removeClass('colorArrowDown').addClass('colorArrowUp');
                that.cpVisible = true;
            }
        });

        //Don't show the colorpicker when we click on the input (to avoid annoyance when pasting hex code)
        this.element.off('click').on('click', function()
        {
            return;
        });

        //Trigger the color change whenever a value changes (avoid having to press enter)
        this.element.off('change').on('change', function () 
        {
            that.element.iris({color: that.element.val()});
        });

        //make sure any specified callback gets called if we're given one
        if(this.callback)
        {
            $(document).on('change keydown paste input','#'+this.id,function()
            {
                that.callback(that.getValue());
            });
        }

        //let all other functions know we're past the creation phase
        this.created = true;
    };

    this.createText = function()
    {
        //Don't create anything without a specified container
        if(!this.container) { return; }
        //Don't create twice
        if(this.created)    { return; }
        
        var input = $('<input />');
        
        if(this.name)       { input.attr('name', this.name);                }
        if(this.disabled)   { input.prop('disabled', 'disabled');           }
        if(this.placeholder){ input.attr('placeholder', this.placeholder);  }
        if(!this.id)
        {
            this.id = this.createRandomString();
        }
        input.attr('id', this.id);
        input.attr('type', 'text');
        
        
        var that = this;

        cont = $('<div/>');
        cont.addClass('sizeInput-container');
        if(this.onoff)
        {
            cont.css('width', 'calc(100% - 41px)');
            cont.css('float', 'left');
        }
        else
        {
            cont.css('width', 'calc(100% - 6px)');
        }
        
        cont.css('margin', '3px');
        cont.append(input);
                

        //check if we need an on/off switch
        if(this.onoff)
        {
            var oo = this.createOnOff();
            this.container.append(oo);
        }
        
        //add it to the DOM
        this.container.append(cont);

        //add an error message container
        this.container.append('<div class="error_msg" id="error_'+this.id+'" />')
        this.errorElement = $('#error_'+this.id);

        //keep a reference to the element in memory
        this.element = $('#'+this.id);

        //make sure any specified callback gets called if we're given one
        if(this.callback)
        {
            $(document).on('change keydown paste input','#'+this.id,function()
            {
                that.callback(that.getValue());
            });
        }

        //let all other functions know we're past the creation phase
        this.created = true;

        //if there was a start value, apply it (now that creation is done)
        if(this.startValue)
        {
            this.setValue(this.startValue, false);
        }

        if(this.disabled)
        {
            this.disable();
        }
    };

    /**
     * Creates a 'size' element, which is a numeric value either in pixels or percentage
    */
    this.createSize = function()
    {
        //Don't create anything without a specified container
        if(!this.container) { return; }
        //Don't create twice
        if(this.created)    { return; }
        
        var input = $('<input />');
        
        if(this.name)       { input.attr('name', this.name);                }
        if(this.disabled)   { input.prop('disabled', 'disabled');           }
        if(this.placeholder){ input.attr('placeholder', this.placeholder);  }
        if(!this.id)
        {
            this.id = this.createRandomString();
        }
        input.attr('id', this.id);
        input.attr('type', 'number');
        

        //.sizeInput-container 
        cont = $('<div/>');
        cont.addClass('sizeInput-container');
        if(this.onoff)
        {
            cont.css('width', 'calc(100% - 41px)');
            cont.css('float', 'left');
        }
        else
        {
            cont.css('width', 'calc(100% - 6px)');
        }
        
        cont.css('margin', '3px');

        var that = this;

        //percent button
        var pcBtn = $('<button/>');
        pcBtn.addClass('inputSubButton');
        pcBtn.addClass('subBtn_off');
        pcBtn.attr('id', this.id+"_pc");
        pcBtn.text('%');
        pcBtn.off('click').on('click', function ()
        {
            if(that.disabled) { return; }
            that.setSizeToPercent();
            if(that.callback) 
            {
                that.callback(that.getValue());
            }
        });

        //pixel button
        var pxBtn = $('<button/>');
        pxBtn.addClass('inputSubButton');
        pxBtn.addClass('subBtn_on');    //use pixels by default
        pxBtn.attr('id', this.id+"_px");
        pxBtn.text('px');
        pxBtn.off('click').on('click', function ()
        {
            if(that.disabled) { return; }
            that.setSizeToPixels();
            if(that.callback) 
            {
                that.callback(that.getValue());
            }
        });

        //use pixels by default
        this.valueInPixels = true;

        //put it all together
        cont.append(input);
        cont.append(pxBtn);
        cont.append(pcBtn);

        //check if we need an on/off switch
        if(this.onoff)
        {
            var oo = this.createOnOff();
            this.container.append(oo);
        }
        
        //add it to the DOM
        this.container.append(cont);

        //add an error message container
        this.container.append('<div class="error_msg" id="error_'+this.id+'" />')
        this.errorElement = $('#error_'+this.id);

        //keep a reference to the element in memory
        this.element = $('#'+this.id);

        //make sure any specified callback gets called if we're given one
        if(this.callback)
        {
            $(document).on('change','#'+this.id,function()
            {
                that.callback(that.getValue());
            });
        }

        //let all other functions know we're past the creation phase
        this.created = true;

        //if there was a start value, apply it (now that creation is done)
        if(this.startValue)
        {
            this.setValue(this.startValue, false);
        }

        if(this.disabled)
        {
            this.disable();
        }

    };

    /**
     * Generates a random 5-character string
    */
    this.createRandomString = function()
    {
        return Math.random().toString(36).substr(2, 5);
    };

    /**
     * Set the container for this panel
     * @param  {mixed}      string (jQuery search string) or jQuery object
     * @return {boolean}    false on failure, true on success
    */
    this.container = null;
    this.setContainer = function(obj)
    {
        //If we're given a jquery obj
        if(obj instanceof jQuery)
        {
            //Apply it
            this.container = obj;
            return true;
        }
        //If we're given a string
        else if(this.isString(obj))
        {
            //Check if it can find it as DOM element using jQuery
            if($(obj).length)
            {
                //Apply it
                this.container = $(obj);
                return true;
            }
        }
        return false;
    };

    this.enable = function(callback=false)
    {
        if(this.created)
        {
            //if(!this.disabled) { return; }

            //enable the main element
            this.element.prop( "disabled", false);

            if(this.onoff)
            {
                $('#'+this.id+"_onoff").prop('checked', true);
            }

            if(this.type == "color")
            {
                //make it half-transparent, to show the color picker isn't in-use
                this.container.css('opacity', '1');
            }

            if(this.type == "slider")
            {
                this.element.rangeslider('update');
            }

            //enable the buttons on the sizer
            if(this.type == "size" || this.type == "slider")
            {
                var percent = this.container.find('#'+this.id+"_pc");
                //we have to check for both disabled and enabled, since a dev can call .enable() twice
                if(percent.hasClass('subBtn_on_disabled') || percent.hasClass('subBtn_on'))
                {
                    //console.log('Turning P% layout to ON');
                    percent.removeClass();
                    percent.addClass('inputSubButton subBtn_on');
                }
                else
                {
                    //console.log('Turning P% layout to OFF');
                    percent.removeClass();
                    percent.addClass('inputSubButton subBtn_off');
                }
                
                var pixels  = this.container.find('#'+this.id+"_px");
                if(pixels.hasClass('subBtn_on_disabled') || pixels.hasClass('subBtn_on'))
                {
                    //console.log('Turning PX layout to ON');
                    pixels.removeClass();
                    pixels.addClass('inputSubButton subBtn_on');
                }
                else
                {
                    //console.log('Turning PX layout to OFF');
                    pixels.removeClass();
                    pixels.addClass('inputSubButton subBtn_off');
                }
            }
        }
        this.disabled = false;
        if(callback && this.callback)
        {
            this.callback("enabled");
        }
    };
    this.disable = function(callback=false)
    {
        if(this.created)
        {
            //disable the main element
            this.element.prop( "disabled", 'disabled' );

            if(this.onoff)
            {
                $('#'+this.id+"_onoff").prop('checked', false);
            }

            if(this.type == "slider")
            {
                this.element.rangeslider('update');
            }

            if(this.type == "color")
            {
                //make it half-transparent, to show the color picker isn't in-use
                this.container.css('opacity', '0.4');

                //if the colorpicker is still expanded, hide it
                if(this.cpVisible)
                {
                    this.element.iris('hide');
                    $('#'+this.id+'_arrow').removeClass('colorArrowUp').addClass('colorArrowDown');
                    this.cpVisible = false;
                }
            }

            //disable the size buttons on the sizer
            if(this.type == "size" || this.type == "slider")
            {
                var percent = this.container.find('#'+this.id+"_pc");
                //we have to check for both disabled and enabled, since a dev can call .disable() twice
                if(percent.hasClass('subBtn_on') || percent.hasClass('subBtn_on_disabled'))
                {
                    percent.removeClass();
                    percent.addClass('inputSubButton subBtn_on_disabled');
                }
                else
                {
                    percent.removeClass();
                    percent.addClass('inputSubButton subBtn_off_disabled');
                }
                
                var pixels  = this.container.find('#'+this.id+"_px");
                if(pixels.hasClass('subBtn_on') || pixels.hasClass('subBtn_on_disabled'))
                {
                    pixels.removeClass();
                    pixels.addClass('inputSubButton subBtn_on_disabled');
                }
                else
                {
                    pixels.removeClass();
                    pixels.addClass('inputSubButton subBtn_off_disabled');
                }
            }
        }
        this.disabled = true;

        if(callback && this.callback)
        {
            this.callback("disabled");
        }
    };

    /*
    Janitor functions
    */
    this.isString = function(s) 
    {
       return Object.prototype.toString.call(s) === "[object String]";
    };

    //run the constructor
    this.constructor(options);
}