/*
inputField Class
by Efraim Meulenberg

Requires jQuery

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
    'type': 'size',                 //type of input field ('size' or 'dropdown')
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
    'type': 'dropdown',             //type of input field ('size' or 'dropdown')
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


The following methods can be use to influence the inputField at realtime:

    inputField.getValue()               //return the value of the input field
    inputField.disable()                //disable the input field
    inputField.enable()                 //enable the input field
    inputField.setValue(v, force)       //set the value of the field to v, force(optional) is a bool to let the callback function know or not
    inputField.setErrorMessage(html)    //create an error message underneath the field

*/

/*

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
        if(options.disabled)    {   this.setDisabled(options.disabled);         }
        if(options.callback)    {   this.setCallback(options.callback);         }
        if(options.value)       {   this.setStartValue(options.value);          }
        if(options.onoff)       {   this.setOnOff(options.onoff);               }

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

            case "dropdown":
                //return the value of the selected item
                return $("#"+this.id+" option:selected").val();
            break;
        }
    };

    //Set the value of the element
    this.setValue = function(v, callback=true)
    {
        switch(this.type)
        {
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
            select.append( $('<option value="'+value+'"/>').text(name) );
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

        //if there was a start value, apply it (not that creation is done)
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

            //enable the buttons on the sizer
            if(this.type == "size")
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

            //disable the size buttons on the sizer
            if(this.type == "size")
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