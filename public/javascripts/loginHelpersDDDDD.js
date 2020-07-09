
var helper = {

    init: function() {

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        showLoading(); 

        $('[name="forgotEmail"]').prop('required', true);
        $('[name="email"]').prop('required', true);
        $('[name="password"]').prop('required', true);

        setTimeout(function() { hideLoading(); }, 1000);

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        var emailPattern = /^\S+@\S+\.\S+/;
        var passwordPattern = /^\S{4,}$/;

        $('#forgotPasswordAnchor').click(function(){
            $('#forgotPasswordFormModal').modal({
                keyboard: false,
                backdrop: 'static'
            })
        });

        $('#forgotPasswordFormModal').on('hidden.bs.modal', function () {
            $('#forgotEmail').val('');
            $('#forgotPasswordForm .loginerror').removeClass('show').html('');
            $('#forgotEmail').removeClass('has-error');
            $('.modalAlertWarning').hide();
            $('.modalOkayBtn').hide();
            $('.modalCancelSubmitBtns').show();
        });

        $('#forgotPasswordForm').on('submit', function(e) {
            console.log('#forgotPasswordSubmitBtn > SUBMIT ++1');
            e.preventDefault();

            $('#forgotEmail').removeClass('has-error');
            $('#forgotPasswordForm .loginerror').removeClass('show').html('');
            
            var email = $('#forgotEmail').val();
            email = email.trim();
            var isEmailValid = emailPattern.test(email);

            if (email === '') {
                $('#forgotEmail').addClass('has-error');
                $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter email');
                return false;
            }
            if (!isEmailValid) {
                $('#forgotEmail').addClass('has-error');
                $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter your valid email');
            }

            $('.loading').show();

            var data = {};
            var pathName = 'email';
            data[pathName] = email;
            pathName = 'expectedResponse';
            data[pathName] = 'true';
            var serviceUrl = $(this).attr('action');
            
            $.ajax({
                rejectUnauthorized: false,
                url: serviceUrl,
                type: 'POST',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',

                success: function(data, status, xhr) {

                    if (data.response === 'success') {
                        console.log('signUpSubmitBtn > ajax > SUCCESS > SUCCESS');

                        $('.modalAlertWarning').show();
                        $('.modalOkayBtn').show();
                        $('.modalCancelSubmitBtns').hide();
                        $('.loading').hide();
                    } else {
                        console.log('signUpSubmitBtn > ajax > SUCCESS > ERROR');

                        $('#forgotEmail').addClass('has-error');
                        $('#forgotPasswordForm .loginerror').addClass('show').html('Could not validate your email.');
                        $('.loading').hide();
                        return false;
                    }
                },
                error: function(xhr, status, error) {
                    console.log('signUpSubmitBtn > ajax > ERROR');

                    $('#forgotEmail').addClass('has-error');
                    $('#forgotPasswordForm .loginerror').addClass('show').html('Could not validate your email, try again or contact customer service.');
                    $('.loading').hide();
                    return false;
                }
            });
        });

        $('#forgotEmail').on('keypress', function(e) {
            var key = e.keyCode;
            if (key === 13) {
                $('#forgotPasswordForm').submit();
            }
        });

/*
    req.body._csrf - typically generated by the body-parser module.
    req.query._csrf - a built-in from Express.js to read from the URL query string.
    req.headers['csrf-token'] - the CSRF-Token HTTP request header.
    req.headers['xsrf-token'] - the XSRF-Token HTTP request header.
    req.headers['x-csrf-token'] - the X-CSRF-Token HTTP request header.
    req.headers['x-xsrf-token'] - the X-XSRF-Token HTTP request header.
*/
        $('body').bind('ajaxSend', function(elm, xhr, s){
            var tokenValue = $('meta[name="_csrf"]').attr('content');
            //xhr.setRequestHeader('X-CSRF-Token', tokenValue);
        });

        $.ajaxSetup({
            //headers: { 'X-CSRF-TOKEN': $('meta[name="_csrf"]').attr('content') }
        });

        $('#loginForm').on('submit', function(e) {
            console.log('#loginForm > SUBMIT > ????? +++')
            e.preventDefault();
            showLoading();

            $('#loginForm .loginerror').removeClass('show');
            $('#loginForm .form-control').removeClass('has-error');

            var data = {};
            var email = $.trim($('#login-email').val());
            var password = $.trim($('#login-password').val());
 
            if (email === '' || password === '') {

                console.log('+++++++++++ BAD FORM!');
                hideLoading();
                return false;

            }else{
                console.log('+++++++++++ GOOD FORM!');

                data = {
                    email: email,
                    password: password,
                    _csrf: $('meta[name="csrf-token"]').attr('content')
                };

                var serviceUrl = $(this).attr('action');

                $.ajax({
                    rejectUnauthorized: false,
                    url: serviceUrl,
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',

                    success: function(data, status, xhr) {
                        if (data.response === 'success') {
                            console.log('#loginForm > ajax > SUCCESS > SUCCESS: ', data);
                            
                            location.href = data.redirect;

                        } else {
                            console.log('#loginForm > ajax > SUCCESS > ERROR');

                            $('#loginForm .form-control').addClass('has-error');
                            $('#loginForm .loginerror').addClass('show');
                            $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                            hideLoading();
                            return false;
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('#loginForm > ajax > ERROR');

                        $('#loginForm .form-control').addClass('has-error');
                        $('#loginForm .loginerror').addClass('show');
                        $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                        hideLoading();
                        return false;
                    }
                });
            }
        });


        $('#loginFormAAAAA').on('submit', function(e) {
            console.log('#loginForm > SUBMIT +++')
            e.preventDefault();
            showLoading();

            $('#loginForm .loginerror').removeClass('show');
            $('#loginForm .form-control').removeClass('has-error');

            var data = {};
            var email = $.trim($('#login-email').val());
            var password = $.trim($('#login-password').val());
            var tokenValue = $('meta[name="csrf-token"]').attr('content');
 
            if (email === '' || password === '') {

                console.log('+++++++++++ BAD FORM!');
                hideLoading();
                return false;

            }else{
                console.log('+++++++++++ GOOD FORM!');
                
                data = {
                    email: email,
                    password: password,
                    _csrf: $('meta[name="csrf-token"]').attr('content')
                };

                header = {
                    ['x-csrf-token']: $('meta[name="csrf-token"]').attr('content')
                };

                var serviceUrl = $(this).attr('action');

                $.ajax({
                    rejectUnauthorized: false,
                    url: serviceUrl,
                    type: 'POST',
                    data: JSON.stringify(data),
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    dataType: 'json',
                    contentType: 'application/json',

                    success: function(data, status, xhr) {
                        if (data.response === 'success') {
                            console.log('#loginForm > ajax > SUCCESS > SUCCESS: ', data);
                            
                            //location.href = data.redirect;

                        } else {
                            console.log('#loginForm > ajax > SUCCESS > ERROR');

                            $('#loginForm .form-control').addClass('has-error');
                            $('#loginForm .loginerror').addClass('show');
                            $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                            hideLoading();
                            return false;
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('#loginForm > ajax > ERROR');

                        $('#loginForm .form-control').addClass('has-error');
                        $('#loginForm .loginerror').addClass('show');
                        $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                        hideLoading();
                        return false;
                    }
                });
            }
        });

        $('#loginFormXXXX').on('submit', function(e) {
            console.log('#loginForm > SUBMIT +++')
            e.preventDefault();
            showLoading();

            $('#loginForm .loginerror').removeClass('show');
            $('#loginForm .form-control').removeClass('has-error');

            var data = {};
            var email = $.trim($('#login-email').val());
            var password = $.trim($('#login-password').val());
            var tokenValue = $('meta[name="csrf-token"]').attr('content');
 
            if (email === '' || password === '') {

                console.log('+++++++++++ BAD FORM!');
                hideLoading();
                return false;

            }else{
                console.log('+++++++++++ GOOD FORM!');

                data = {
                    email: email,
                    password: password
                };

                var serviceUrl = $(this).attr('action');

                //helper.setCSRFToken('x-csrf-token', $('meta[name="csrf-token"]').attr('content'));
                console.log('================================ csrf X+++')

                //$.ajaxPrefilter(function(options, originalOptions, xhr) {
                    //xhr.setRequestHeader('csrf-token', $('meta[name="csrf-token"]').attr('content'));
                //});

                $.ajax({
                    rejectUnauthorized: false,
                    url: serviceUrl,
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    beforeSend: function(xhr, settings){
                        xhr.setRequestHeader('csrf-token', tokenValue);
                    },

                    success: function(data, status, xhr) {
                        if (data.response === 'success') {
                            console.log('#loginForm > ajax > SUCCESS > SUCCESS: ', data);
                            
                            location.href = data.redirect;

                        } else {
                            console.log('#loginForm > ajax > SUCCESS > ERROR');

                            $('#loginForm .form-control').addClass('has-error');
                            $('#loginForm .loginerror').addClass('show');
                            $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                            hideLoading();
                            return false;
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('#loginForm > ajax > ERROR');

                        $('#loginForm .form-control').addClass('has-error');
                        $('#loginForm .loginerror').addClass('show');
                        $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                        hideLoading();
                        return false;
                    }
                });
            }
        });
    },

    setCSRFToken: function (header, securityToken) {
        console.log('================================ csrf XXXXX+++')
        //console.log('setCSRFToken > headr/securityToken: ', header, ' : ', securityToken);
        $.ajaxPrefilter(function(options, originalOptions, xhr) {
            xhr.setRequestHeader(header, securityToken);
        });
    },

    /*
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        var token = $("meta[name='_csrf']").attr("content");
        var header = $("meta[name='_csrf_header']").attr("content");          
        jqXHR.setRequestHeader(header, token);
    });
    */

    showLoading: function() {
        $('.modal-backdrop').show();
    },

    hideLoading: function() {
        $('.modal-backdrop').hide();
    },

    clearForgotPassword: function() {
        $("#forgotPasswordForm").get(0).reset();
        $('#forgotEmail').val('');
        $('#forgotPasswordForm .loginerror').addClass('hide');
        $('#forgotPasswordForm .loginerror').text('');
        $('#forgotEmail').removeClass('invalid');
        $('.modalAlertWarning').hide();
        $('.modalOkayBtn').hide();
        $('.modalCancelSubmitBtns').show();
    },

}

$(function () {
    helper.init();
});

