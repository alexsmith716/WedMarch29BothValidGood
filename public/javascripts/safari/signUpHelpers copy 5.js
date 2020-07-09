
/* Safari */
var helper = {

    init: function() {

        document.getElementById('state').setAttribute('tabindex', '9');

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };
        
        showLoading();

        $('[name="displayname"]').prop('required', true);
        $('[name="email"]').prop('required', true);
        $('[name="confirmEmail"]').prop('required', true);
        $('[name="password"]').prop('required', true);
        $('[name="confirmPassword"]').prop('required', true);
        $('[name="firstname"]').prop('required', true);
        $('[name="lastname"]').prop('required', true);
        $('[name="city"]').prop('required', true);
        $('[name="state"]').prop('required', true);
 
        setTimeout(function() { hideLoading(); }, 500);

        helper.initializeJqueryEvents();
    },

    /* ++++++++++++++++++ Safari ++++++++++++++++++ */

    // Make sure CSRF tokens can not be accessed with AJAX! 
    // Don't create a /csrf route just to grab a token, and especially don't support CORS on that route!

    initializeJqueryEvents:  function(){

        $('#signUpForm').on('submit', function(e) {

            console.log('#signUpForm > SUBMIT > SAFARI !!');

            $('#signUpForm .form-control').removeClass('has-error');
            $('#signUpForm .form-group .error').removeClass('show').addClass('hide');
            $('#signUpForm .form-group .text-danger').removeClass('show').addClass('hide');

            e.preventDefault();
            showLoading();

            $('.formerror').removeClass('show');
            var data = helper.postData();
            var formValid = true;
            var focusFirstElement = null;
            var formElements = document.getElementById('signUpForm').querySelectorAll('[required]');
            var serviceUrl = $(this).attr('action');

            Object.keys(data).forEach(function(p) {
                if(p !== 'password' && p !== 'confirmPassword'){
                    $('#'+p).val(data[p].trim());
                }
            });
         
            for( var i = 0; i < formElements.length; i++ ) {
                var element = $(formElements[i]);
                var checkConstraints = element.get(0).checkValidity();

                if(!checkConstraints){
                    formValid = false;
                    if(focusFirstElement === null){
                        focusFirstElement = formElements[i];
                        focusFirstElement.focus();
                    }
                    var boundEventTypes = $._data( element[0], 'events' );
                    for (var eType in boundEventTypes){
                      //helper.handleFormEvents(element.attr('id'), eType);
                      helper.handleFormEvents(element.attr('id'), 'focusout');
                    }
                }    
            }

            if (!formValid){

                console.log('+++++++++++ BAD FORM!');
                focusFirstElement = null;
                hideLoading();
                return false;
            }
     
            console.log('+++++++++++ GOOD FORM!');

            data['_csrf'] = $('meta[name="csrf-token"]').attr('content');
            
            $.ajax({

                rejectUnauthorized: false,
                url: serviceUrl,
                type: 'POST',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                accepts: 'application/json',
            
                success: function(data, status, xhr) {

                    if (data.response === 'success') {
                        console.log('#signUpForm > ajax > SUCCESS > SUCCESS');
                        console.log('#signUpForm > ajax > SUCCESS > SUCCESS > data: ', data);
                        /*
                        .form-group
                            span.hide.error
                            span.hide.text-danger
                        .text-danger.hide.formerror
                        */
                        $('#signUpForm .form-control').removeClass('has-error');
                        $('#signUpForm .form-group .error').removeClass('show').addClass('hide');
                        $('#signUpForm .form-group .text-danger').removeClass('show').addClass('hide');
                        $('.formerror').removeClass('show').addClass('hide');

                        //location.href = data.redirect;

                    } else {
                        console.log('#signUpForm > ajax > SUCCESS > ERROR');
                        console.log('#signUpForm > ajax > SUCCESS > ERROR > data: ', data.invalidInputData);

                        //console.log('signUpForm > ajax > success > error > data.response: ', data.response)
                        //console.log('signUpForm > ajax > success > error > data.invalidInputData: ', data.invalidInputData)
                        
                        helper.handleErrorResponse(data.validatedData);
        
                        //$('#signUpForm .form-control').addClass('has-error');
                        //$('.formerror').text('Please correct the above errors and submit form again');
                        //$('.formerror').removeClass('hide');

                        hideLoading();
                        return false;
                    }
                },

                error: function(xhr, status, error) {
                    hideLoading();

                    //var parsedXHR = JSON.parse(xhr.responseText);
                    var parsedXHR = xhr;

                    console.log('#signUpForm > ajax > ERROR > ERROR > parsedXHR: ', parsedXHR);

                    if(parsedXHR.type === 'token'){
                        location.href = parsedXHR.redirect;
                    }else{
                        $('#signUpForm .form-control').addClass('has-error');
                        $('.formerror').removeClass('hide'); 
                    }
                    return false;
                }
            });
        });

        $('#displayname').on('focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'));
        });

        $('#email').on('change focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'), e.type, $(this).val());
        });

        $('#confirmEmail').on('change focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'), e.type, $(this).val());
        });

        $('#password').on('change focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'), e.type);
        });

        $('#confirmPassword').on('change focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'), e.type);
        });

        $('#firstname').on('focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'));
        });

        $('#lastname').on('focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'));
        });

        $('#city').on('focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'));
        });

        $('#state').on('change focusout', function(e) {
            helper.handleFormEvents($(this).attr('id'));
        });

    },

    // ^(?=\s*\S)(.{1,35})$
    // (.{1,35})
    // .*\\S(.{1,35})
    // Try .*\w.* as your expression. 
    // .*\S.*
    // .*\w.*
    // ^(?=\\s*\\S).*$
    // ^(?!\\s*$).+
    // .*\\S.*
    // This will match any string that contains at least a single non-white space. 
    // In defining your regex, make sure to escape the backslash, so use ".*\\w.*" as your String.
    // [^ \t\r\n\v\f]{4,}
    pattern: {
        displayname: /^[A-Za-z0-9_]{4,21}$/,
        email: /^\S+@\S+\.\S+/,
        password: /^\S{4,}/,
        basictext: /^(?=\s*\S)(.{1,35})$/,
    },


    showLoading: function() {
        $('.modal-backdrop').show();
    },


    hideLoading: function() {
        $('.modal-backdrop').hide();
    },


    handleFormEvents: function(elementID, eType, elementVal) {

        elementID === 'displayname' ? helper.displaynameElementValidation(elementID) : null;

        elementID === 'email' ? helper.emailElementValidation(elementID, 'confirmEmail', eType, elementVal) : null;
        elementID === 'confirmEmail' ? helper.emailElementValidation(elementID, 'email', eType, elementVal) : null;

        elementID === 'password' ? helper.passwordElementValidation(elementID, 'confirmPassword', eType) : null;
        elementID === 'confirmPassword' ? helper.passwordElementValidation(elementID, 'password', eType) : null;

        elementID === 'firstname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null;
        elementID === 'lastname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null;
        elementID === 'city' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null;
        elementID === 'state' ? helper.selectElementValidation(elementID) : null;
    },

    displaynameElementValidation: function(elementID) {

        var thisElement = $('#'+elementID);
        var pattern = helper.pattern.displayname;

        thisElement.on('input', function(){

            helper.testUserInput(elementID,pattern);
        });

        helper.testUserInput(elementID,pattern);
    },


    emailElementValidation: function(elementID, confirmElementID, eType, elementVal) {
       
        var thisElement = $('#'+elementID);

        if (eType === 'change') {
            console.log('#emailElementValidation > change > elementID/elementVal', elementID, ' :: ', elementVal)
            helper.validateEmailField(elementVal, elementID, confirmElementID);
        }

        if (eType === 'focusout') {
            console.log('#emailElementValidation > focusout > elementID/elementVal', elementID, ' :: ', elementVal)
            thisElement.on('input', function(){
                helper.testUserInputEmail(elementID);
            });
            helper.testUserInputEmail(elementID);
        }
    
    },


    passwordElementValidation: function(elementID,confirmElementID,eType) {

        var thisElement = $('#'+elementID);
        var pattern = helper.pattern.password;

        helper.validateParams('password', 'confirmPassword');
        /*
        if (eType === 'change') {
            console.log('### passwordElementValidation > CHANGE +++')
            if(helper.validateParams('password', 'confirmPassword')){
                $('#'+confirmElementID).off('input');
            }
        }
        if (eType === 'focusout') {
            console.log('### passwordElementValidation > FOCUSOUT +++')
            thisElement.on('input', function(){
                helper.testUserInput(elementID,pattern);
            });
            helper.testUserInput(elementID,pattern);
        }
        */
    },

    // AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz
    validateMaxLengthUserInput: function (val,maxlen) {
        val = val.trim();
        var newVal = (val.length) - maxlen;
        newVal = (val.length) - newVal;
        newVal = val.slice(0,newVal);
        return newVal;
    },

    textElementValidation: function(elementID, pattern, err1) {

        var thisElementValue = $('#'+elementID).val().trim();
        var title = $('#'+elementID).attr('title');
        err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null;
        //thisElementValue = thisElementValue.trim();
        var patternTestValue = pattern.test(thisElementValue);
        err1 !== undefined && err1.lengthError === 'maxlength' ? patternTestValue = false : null;

        if(err1 !== undefined){
            console.log('textElementValidation 1/2/3/4 ++0: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue, ' || ', err1)
        }else{
            console.log('textElementValidation 1/2/3/4 ++0: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue)
        }

        if(thisElementValue !== ''){

            if(!patternTestValue){

                console.log('textElementValidation ++1: ', elementID, ' || ', thisElementValue);

                is_safari ? $('#'+elementID+'Error').text('Invalid input. '+$('#'+elementID).attr('title')) : null;
                err1 !== undefined && !is_safari ? $('#'+elementID+'Error').text('Please match the requested format. '+ title) : null;
    
                if((err1 !== undefined && !is_safari) ||  is_safari){
                    console.log('textElementValidation ++2: ', elementID, ' || ', thisElementValue)
                    $('#'+elementID+'Error').removeClass('hide').addClass('show');
                    //$('#'+elementID).addClass('has-error');
                }


                if(err1 !== undefined &&  err1.lengthError === 'maxlength'){
                    console.log('textElementValidation ++3: ', elementID, ' || ', thisElementValue)
                    //console.log('textElementValidation ++1: ', elementID, ' :: ', err1);
                    var newVal = helper.validateMaxLengthUserInput($('#'+elementID).val(), err1.stringValLength);
                    $('#'+elementID).val(newVal);
                }

            }else{

                console.log('textElementValidation ++4: ', elementID, ' || ', thisElementValue)
                //console.log('textElementValidation ++++2: ', elementID, ' || ', thisElementValue, ' || ', err1.error, ' || ', err1.lengthError)
                is_safari ? $('#'+elementID+'Error').text('') : null;
                is_safari ? $('#'+elementID+'Error').removeClass('show').addClass('hide') : null;
                $('#'+elementID).get(0).setCustomValidity('')

            }

        }else{

            console.log('textElementValidation ++7: ', elementID, ' || ', thisElementValue)
            //console.log('textElementValidation ++++3: ', elementID, ' || ', thisElementValue, ' || ', err1.error, ' || ', err1.lengthError)
            //is_safari ? $('#'+elementID+'Error').text('Please fill out this field. ' + $('#'+elementID).attr('title')) : null;
            //is_safari ? $('#'+elementID+'Error').removeClass('hide').addClass('show') : null;

            is_safari ? $('#'+elementID+'Error').text('Please fill out this field. ' + $('#'+elementID).attr('title')) : null;
            err1 !== undefined && !is_safari ? $('#'+elementID+'Error').text('Please fill out this field.') : null;

            if((err1 !== undefined && !is_safari) ||  is_safari){
                console.log('textElementValidation ++8: ', elementID, ' || ', thisElementValue)
                $('#'+elementID+'Error').removeClass('hide').addClass('show')
                //$('#'+elementID).addClass('has-error');
            }

        }
    },


    selectElementValidation: function(elementID, err1) {

        var thisElementValue = $('#'+elementID).val();
        err1 !== undefined && err1 === 'empty' ? thisElementValue = '' : null;

        if(err1 !== undefined){
            console.log('#selectElementValidation 111:', elementID, ' :: ', err1, ' :: ', thisElementValue);
        }else{
            console.log('#selectElementValidation 222:', elementID, ' :: ', thisElementValue);
        }
        
        
        if(thisElementValue !== ''){

            if(is_safari){
                console.log('#selectElementValidation 333:', elementID, ' :: ', thisElementValue);
                //$('#'+elementID+'Error').text('');
                //$('#'+elementID+'Error').removeClass('show').addClass('hide');
            }

            console.log('#selectElementValidation 444:', elementID, ' :: ', thisElementValue);

            $('#'+elementID+'Error').text('');
            $('#'+elementID+'Error').removeClass('show').addClass('hide');

            !is_safari ? $('#'+elementID).get(0).setCustomValidity('') : null;

        }else{

            is_safari ? $('#'+elementID+'Error').text('Please select an option. ' + $('#'+elementID).attr('title')) : null;
            !is_safari ? $('#'+elementID).get(0).setCustomValidity('Please select an item in the list.') : null;
            err1 !== undefined && !is_safari ? $('#'+elementID+'Error').text('Please select an item in the list.') : null;

            console.log('#selectElementValidation 555:', elementID, ' :: ', thisElementValue);

            if((err1 !== undefined && !is_safari) ||  is_safari){
                console.log('#selectElementValidation 666:', elementID, ' :: ', thisElementValue);
                $('#'+elementID+'Error').removeClass('hide').addClass('show')
                //$('#'+elementID).addClass('has-error');
            }
        }
    },


    elementIDtoTitleCase: function(whichID) {
        whichID = whichID.replace(/([A-Z])/g, ' $1');
        labelText = whichID.replace(/^./, function(str){ return str.toUpperCase(); })
        return labelText;
    },


    testUserInput: function(elementID, pattern, err1) {

        if(err1 !== undefined){
            console.log('#testUserInput > elementID/pattern/err1:', elementID, ' :: ', pattern, ' :: ', err1);
        }else{
            console.log('#testUserInput > elementID/pattern/err1:', elementID, ' :: ', pattern);
        }

        var thisElementValue = $('#'+elementID).val().trim();
        err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null; 
        //thisElementValue = thisElementValue.trim();

        var patternTestValue = pattern.test(thisElementValue);
        err1 !== undefined && err1.error === 'invalid' ? patternTestValue = false : null;

        var charCount = thisElementValue.length;
        err1 !== undefined && err1.stringValLength ? charCount = err1.stringValLength : null;

        var errorElement = $('#'+elementID+'Error');
        var title = $('#'+elementID).attr('title');

        console.log('#testUserInput > elementID/pattern/charCount:', elementID, ' :: ', patternTestValue, ' :: ', charCount);

        if(thisElementValue === ''){

            console.log('#testUserInput 1:', elementID);
            is_safari ? errorElement.text('Please fill out this field. '+ title) : null;
            err1 !== undefined && !is_safari ? errorElement.text('Please fill out this field.') : null;

            if((err1 !== undefined && !is_safari) ||  is_safari){
                errorElement.removeClass('hide').addClass('show');
                //$('#'+elementID).addClass('has-error');
            }

        }else if(charCount < 4){
            
            // if its a confirm element
            if(elementID.indexOf('confirm') != -1) {
                console.log('#testUserInput 2:', elementID);
                is_safari ? errorElement.text('Invalid input. '+ title) : null;

            }else{
                console.log('#testUserInput 3:', elementID);
                is_safari ? errorElement.text('Please enter at least 4 character(s). You entered '+charCount+'. '+ title) : null;
            }

            console.log('#testUserInput 3++++++++++++++++++111:', elementID);

            err1 !== undefined && !is_safari ? errorElement.text('Please match the requested format. '+ title) : null;
            
            if((err1 !== undefined && !is_safari) ||  is_safari){
                errorElement.removeClass('hide').addClass('show');
                //$('#'+elementID).addClass('has-error');
            }

        }else if(charCount >= 4){

            if(!patternTestValue){

                console.log('#testUserInput 4:', elementID);

                is_safari ? errorElement.text('Invalid input. '+$('#'+elementID).attr('title')) : null;
                err1 !== undefined && !is_safari ? errorElement.text('Please match the requested format. '+ title) : null;
    
                if((err1 !== undefined && !is_safari) ||  is_safari){
                    errorElement.removeClass('hide').addClass('show');
                    //$('#'+elementID).addClass('has-error');
                }


                if(err1 !== undefined &&  err1.lengthError === 'maxlength'){
                    console.log('#testUserInput 5:', elementID);
                    var newVal = helper.validateMaxLengthUserInput($('#'+elementID).val(), err1.stringValLength);
                    $('#'+elementID).val(newVal);
                }

            }else{

                console.log('#testUserInput 6:', elementID);
                //is_safari ? errorElement.text('') : null;
                //is_safari ? errorElement.removeClass('show').addClass('hide') : null;
                errorElement.text('');
                errorElement.removeClass('show').addClass('hide');
                //$('#'+elementID).removeClass('has-error');
                !is_safari ? $('#'+elementID).get(0).setCustomValidity('') : null;
                $('#'+elementID).off('input');
            }
        }
    },


    validateEmailValue: function(email) {
        var pattern = helper.pattern.email;
        return pattern.test(email);
    },


    validateEmailService: function(email, callback) {

        console.log('validateEmailService 1++++++ email: ', email);
        var data = {};
        var pathName = 'email';
        data[pathName] = email;
        pathName = 'expectedResponse';
        data[pathName] = 'false';
        helper.showLoading();

        $.ajax({
            rejectUnauthorized: false,
            url: 'https://localhost:3000/api/evaluateuseremail',
            type: 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            async: true,

            success: function(data, status, xhr) {

                if (data.response === 'success') {
                    console.log('validateEmailService 2++++++ SUCCESS > SUCCESS > true');
                    callback(true);

                } else {
                    console.log('validateEmailService 3++++++ SUCCESS > ERROR > false');
                    callback(false);

                }

                helper.hideLoading();
            },

            error: function(xhr, status, error) {

                console.log('validateEmailService 4++++++ ERROR > ERROR: ', email);

            }
        });
    },


    validateParams: function(str1, str2, err1) {
        if(err1 !== undefined){
            console.log('## validateParams 1 > str1/str2/err1: ', str1, ' || ', str2, ' || ', err1)
        }else{
            console.log('## validateParams 1 > str1/str2: ', str1, ' || ', str2)
        }

        // if confirmValue (str2) is NOT empty
        if ((err1 !== undefined && (err1.error === 'nomatch' || err1.error === 'match')) || $('#' + str2).val() !== '') {
     
            
            var property1 = document.getElementsByName(str1)[0];
            var property2 = document.getElementsByName(str2)[0];
            console.log('## validateParams 222: ', property1.value, ' :: ', property2.value)

            if ((err1 !== undefined && err1.error === 'nomatch') || property1.value !== property2.value) {
 
                console.log('## validateParams 333')
                if (is_safari) {
                    console.log('## validateParams 444')
                    if (str2 === 'email') {
                        console.log('## validateParams 555')
                        $('#' + str1 + 'Match').removeClass('hide').addClass('show');
                    } else {
                        console.log('## validateParams 666')
                        $('#' + str2 + 'Match').removeClass('hide').addClass('show');
                    }
                }else{
                    if(err1 !== undefined){
                        console.log('## validateParams 777')
                        $('#' + str2 + 'Match').removeClass('hide').addClass('show');
                    }else{
                        console.log('## validateParams 888')
                        $('#'+ str2).get(0).setCustomValidity(helper.elementIDtoTitleCase(str1) + 's don\'t match');
                    }

                    //$('#'+ str1).get(0).setCustomValidity(helper.elementIDtoTitleCase(str1) + 's don\'t match');
                    //$('#'+ str2).get(0).setCustomValidity(helper.elementIDtoTitleCase(str1) + 's don\'t match');
                }

                return false;

            } else {

                if (is_safari) {
          
                    if (str2 === 'email') {
                        console.log('## validateParams 999 222')
                        $('#' + str1 + 'Match').removeClass('show').addClass('hide');
                    } else {
                        console.log('## validateParams 999 333')
                        $('#' + str2 + 'Match').removeClass('show').addClass('hide');
                    }

                }else {
                    console.log('## validateParams 999 444')

                    if(err1 === undefined){
                        console.log('## validateParams 999 555')
                        $('#'+str1).get(0).setCustomValidity('');
                        $('#'+str2).get(0).setCustomValidity('');
                    }else{
                        console.log('## validateParams 999 888')
                        $('#' + str2 + 'Match').removeClass('show').addClass('hide');
                    }
                }
    
                /*
                if (is_safari) {
                    if (str2 === 'email') {
                        $('#' + str1 + 'Match').removeClass('show').addClass('hide');
                    } else {
                        $('#' + str2 + 'Match').removeClass('show').addClass('hide');
                    }
                }
                $('#'+str1).get(0).setCustomValidity('');
                $('#'+str2).get(0).setCustomValidity('');
                */
                return true;
            }
        }
    },


    testUserInputEmail: function(elementID, err1) {

        var thisElementValue = $('#'+elementID).val();
        var thisErrorElement = $('#'+elementID+'Error');
        var title = $('#'+elementID).attr('title');
        var isEmailValid;

        err1 === undefined ? isEmailValid = helper.validateEmailValue(thisElementValue) : null;
    

        if ((err1 !== undefined && (err1.error === 'false' || err1.error === 'match')) || (err1 === undefined && isEmailValid)) {

            console.log('#testUserInputEmail 1 > elementID', elementID)
            err1 !== undefined || is_safari ? thisErrorElement.text('') : null;
            err1 !== undefined || is_safari ? thisErrorElement.removeClass('show').addClass('hide') : null;
            $('#'+elementID).off('input');
    

        }else if((err1 !== undefined && err1.error === 'empty') || thisElementValue === ''){

            console.log('#testUserInputEmail 2 > elementID', elementID)
            err1 !== undefined || is_safari ? thisErrorElement.text('Please fill out this field. ' + title) : null;
            err1 !== undefined || is_safari ? thisErrorElement.removeClass('hide').addClass('show') : null;
    

        }else if((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)){

            console.log('#testUserInputEmail 3 > elementID', elementID)
            err1 !== undefined || is_safari ? thisErrorElement.text('Please enter an email address. ' + title) : null;
            err1 !== undefined || is_safari ? thisErrorElement.removeClass('hide').addClass('show') : null;

        }
    },


    validateEmailField: function(elementVal, thisField, comparedField, err1) {

        if(err1 !== undefined){
            console.log('#validateEmailField 1 > thisField/err1', thisField, ' :: ', err1)
        }else{
            console.log('#validateEmailField 1 > thisField', thisField)
        }

        var isEmailValid;

        err1 === undefined || err1.error === 'false' ? isEmailValid = helper.validateEmailValue(elementVal) : null;

        // EMAIL IS VALID +++++++++++++++++++
        if ((err1 !== undefined && (err1.error !== 'invalid' && err1.error !== 'empty')) || isEmailValid) {
    
            err1 !== undefined || is_safari ? $('#'+thisField+'Improper').removeClass('show').addClass('hide') : null;
            !is_safari ? $('#'+thisField).get(0).setCustomValidity('') : null;
            $('#'+thisField).off('input');
    
            if(isEmailValid){

                console.log('#validateEmailField 22222 > thisField', thisField)
                helper.validateEmailService(elementVal, function(notRegistered) {

                    if(!notRegistered){
                        console.log('#validateEmailField 33333 > 1/2/3: ', elementVal, ' :: ', thisField, ' :: ', notRegistered)
                        is_safari ? $('#emailRegistered').removeClass('hide').addClass('show') : null;
                        !is_safari ? $('#'+thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null;

                    } else {
                        console.log('#validateEmailField 44444 > 1/2/3: ', elementVal, ' :: ', thisField, ' :: ', notRegistered)
                        is_safari ? $('#emailRegistered').removeClass('show').addClass('hide') : null;
                        helper.validateParams(thisField, comparedField);
                    }
                });
            }else{
                if(err1 !== undefined && err1.error === 'registered'){
                    console.log('#validateEmailField 55555 > thisField:', thisField)
                    $('#emailRegistered').removeClass('hide').addClass('show');
                    //$('#'+thisField).addClass('has-error');
                    //is_safari ? $('#emailRegistered').removeClass('hide').addClass('show') : null;
                    //!is_safari ? $('#'+thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null;

                }else{
                    console.log('#validateEmailField 666666 > thisField:', thisField)
                    helper.validateParams(thisField, comparedField, err1);
                }
            }
    
        //} else if((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)){
        }

        // EMAIL IS NOT VALID +++++++++++++++++++
        if((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)){
  
            console.log('#validateEmailField 7777 > thisField', thisField)
            //is_safari ? $('#'+thisField+'Improper').removeClass('hide').addClass('show') : null; 
            //!is_safari ? $('#'+thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + ' is in improper format') : null;

            if(err1 !== undefined || is_safari){

                console.log('#validateEmailField 8888 > thisField', thisField)
                $('#'+thisField+'Improper').removeClass('hide').addClass('show');

            }else{

                console.log('#validateEmailField 9999 > thisField', thisField)
                $('#'+thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + ' is in improper format')

            }

        }
        err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null;
    },


    postData: function() {
        var data = {
            displayname: $('#displayname').val(),
            email: $('#email').val(),
            confirmEmail: $('#confirmEmail').val(),
            password: $('#password').val(),
            confirmPassword: $('#confirmPassword').val(),
            firstname: $('#firstname').val(),
            lastname: $('#lastname').val(),
            city: $('#city').val(),
            state: $('#state').val()
        };
        return data;
    },


    formatDate: function(date) {
       return (date.getHours() < 10 ? '0' : '') + date.getHours() +
               ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() +
               ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() +
               '.' + (date.getMilliseconds() < 10 ? '00' : (date.getMilliseconds() < 100 ? '0' : '')) +
               date.getMilliseconds();
    },


    handleErrorResponse: function(data) {

        console.log('######## handleErrorResponse 1 $$$$$$$$$$$$$$$$: ', data);

        Object.keys(data).forEach(function(p) {
            console.log('######## handleErrorResponse 2 $$$$$$$$$$$$$$$$: ', p, ' | ', data[p]);

            switch (p) {
                
                case 'displayname':
                    helper.testUserInput(p, helper.pattern.displayname, data[p]);
                    break;

                case 'email':
                    helper.validateEmailField(null, 'email', 'confirmEmail', data[p]);
                    break;

                case 'confirmEmail':
                    helper.validateEmailField(null, 'confirmEmail', 'email', data[p]);
                    break;
   
                case 'password':
                    if(helper.validateParams('password', 'confirmPassword', data[p])){
                        $('#confirmPassword').off('input');
                    }
                    helper.testUserInput(p, helper.pattern.password, data[p]);
                    break;

                case 'confirmPassword':
                    if(helper.validateParams('password', 'confirmPassword', data[p])){
                        $('#password').off('input');
                    }
                    helper.testUserInput(p, helper.pattern.password, data[p]);
                    break;
       
                case 'firstname':
                case 'lastname':
                case 'city':
                    helper.textElementValidation(p, helper.pattern.basictext, data[p]);
                    break;

                case 'state':
                    helper.selectElementValidation(p, data[p])
                    break;
            }
        });
    },

}

$(function () {
    helper.init();
});

