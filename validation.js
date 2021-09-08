function validation(valueControl) {
    let formElement = document.querySelector(valueControl.form);
    let btnSubmid = formElement.querySelector(valueControl.submit);
    let changePassElement = formElement.querySelector(valueControl.classChangePass);
    if (changePassElement) {
        changeInfoUser(changePassElement, formElement, valueControl, btnSubmid);
        deleteDataDb(valueControl, formElement);
    }
    else {
        let arr = valueControl.rules.map((rule) => {
            return {
                input: rule.value,
                test: rule.test,
                password: rule.password
            };
        });
        let pass;
        let valueControlArray = {};
        for (let i in arr) {
            if (arr[i].password) {
                pass = arr[i].password;
            }

            if (Array.isArray(valueControlArray[arr[i].input])) {
                valueControlArray[arr[i].input].push(arr[i].test);
            }
            else {
                valueControlArray[arr[i].input] = [arr[i].test];
            }
        }
        buttonSubmit(valueControlArray, formElement, valueControl, btnSubmid, pass);
        check(valueControlArray, formElement, valueControl, pass);
    }

    let formSelectorChangeElement = formElement.querySelector(valueControl.formSelectorChange);
    let formDisplayElement = document.querySelector(valueControl.formDisplay);
    if (formSelectorChangeElement) {
        formSelectorChangeElement.onclick = () => {
            formElement.style.display = "none";
            formDisplayElement.style.display = "block";
        }
    }
}

function buttonSubmit(valueControlArray, formElement, valueControl, btnSubmid, pass) {
    btnSubmid.onclick = (e) => {
        e.preventDefault();
        let isSuccess = true;
        for (let i in valueControlArray) {
            let inputElement = formElement.querySelector(i);
            let formgroupElement = inputElement.parentElement;
            let confirmPasswordElement = formElement.querySelector(pass);
            let errorElement = formgroupElement.querySelector(valueControl.errorMassage);
            for (let j = 0; j < valueControlArray[i].length; j++) {
                if (confirmPasswordElement) {
                    if (valueControlArray[i][j](inputElement.value, confirmPasswordElement.value)) {
                        formgroupElement.classList.add('error');
                        isSuccess = false;
                        if (errorElement) {
                            errorElement.innerText = valueControlArray[i][j](inputElement.value, confirmPasswordElement.value);
                        }
                        break;
                    }
                }
                else {
                    if (valueControlArray[i][j](inputElement.value)) {
                        formgroupElement.classList.add('error');
                        isSuccess = false;
                        if (errorElement) {
                            errorElement.innerText = valueControlArray[i][j](inputElement.value);
                        }
                        break;
                    }
                }
            }
        }
        var data = false;
        if (isSuccess) {
            data = {};
            for (let i in valueControlArray) {
                data[i] = formElement.querySelector(i).value;
            }
        }
        valueControl.dataForm(data);
    }
}


function buttonSubmitChange(valueControlArray, valueControl, formElement, btnSubmid, pass, boolean) {
    btnSubmid.onclick = (e) => {
        e.preventDefault();
        let isSuccess = true;
        let confirmPasswordElement = formElement.querySelector(pass);
        let formgroupElement = formElement.querySelector(valueControl.formGroup);
        formgroupElement = formgroupElement.parentElement;
        let temp = false;
        for (let i in valueControlArray) {
            let inputElement = formElement.querySelector(i);
            if (inputElement.type == "radio" || inputElement.type == "checkbox") {
                let inputElement = formElement.querySelectorAll(i + ":checked");
                inputElement = Array.from(inputElement);
                for (let z of inputElement) {
                    if (z.checked) {
                        temp = true;
                    }
                }
            }
            else if (inputElement.type !== "radio" || inputElement.type !== "checkbox") {
                let formgroupElement = inputElement.parentElement;
                let errorElement = formgroupElement.querySelector(valueControl.errorMassage);
                for (let j = 0; j < valueControlArray[i].length; j++) {
                    if (confirmPasswordElement) {
                        if (valueControlArray[i][j](inputElement.value, confirmPasswordElement.value)) {
                            formgroupElement.classList.add('error');
                            isSuccess = false;
                            if (errorElement) {
                                errorElement.innerText = valueControlArray[i][j](inputElement.value, confirmPasswordElement.value);
                            }
                            break;
                        }
                    }
                    else {
                        if (valueControlArray[i][j](inputElement.value)) {
                            formgroupElement.classList.add('error');
                            isSuccess = false;
                            if (errorElement) {
                                errorElement.innerText = valueControlArray[i][j](inputElement.value);
                            }
                            break;
                        }
                    }
                }
            }

        }
        if (temp) {
            formgroupElement.classList.remove("error");
        }
        else {
            formgroupElement.classList.add("error");
            isSuccess = false
        }
        let data = takeData(valueControl, formElement, isSuccess);
        valueControl.dataForm(data);
        if (!boolean) {
            let updateData = {};
            for (let i in data) {
                updateData[i.replace(".", "#")] = data[i];
            }       
            let inputEmailElement = formElement.querySelector(valueControl.email);
            getUser(valueControl.userApi, function (dataApi) {
                for (let i = 0; i < dataApi.length; i++) {
                    for (let j in dataApi[i]) {
                        if (dataApi[i][j] === inputEmailElement.value) {
                            updateUser(dataApi[i]["id"], valueControl.userApi, updateData);
                            break;
                        }
                    }
                }
            });
        }
    }
}

function takeData(valueControl, formElement, isSuccess) {
    let data = false;
    if (isSuccess) {
        data = {};
        for (let i in valueControl.inputData) {
            let inputDataElement = formElement.querySelector(valueControl.inputData[i]);
            if (inputDataElement.type == "radio" && inputDataElement.checked) {
                data[valueControl.gender] = inputDataElement.value;
            }
            else if (inputDataElement.value && inputDataElement.type != "radio") {
                data[valueControl.inputData[i]] = inputDataElement.value;
            }
        }
    }
    return data;
}


function retypeInfo(valueControl, formElement, valueControlArray) {
    let buttonRetypeElement = formElement.querySelector(valueControl.btnRetype);
    if (buttonRetypeElement) {
        buttonRetypeElement.onclick = (e) => {
            e.preventDefault();
            for (let i in valueControl.inputData) {
                let inputDataElement = formElement.querySelector(valueControl.inputData[i]);
                if (valueControl.inputData[i] === valueControl.inputData.email) continue;
                else if (inputDataElement.type == "radio" || inputDataElement.type == "checkbox" && inputDataElement.checked) {
                    inputDataElement.checked = false;
                }
                else {
                    inputDataElement.value = "";
                }
            }

        }
    }
}


function checkUser(userApi, data, email, password, checkstr) {
    let formElement = document.querySelector(checkstr.form);
    let errorMassageEmail = formElement.querySelector(checkstr.errorMassageEmail);
    let errorMassagePass = formElement.querySelector(checkstr.errorMassagePass);
    let formGroupElement = errorMassageEmail.parentElement;
    let formDisplayElement = document.querySelector(checkstr.form3);
    getUser(userApi, function (dataApi) {
        let emailDb = false, passwordDb = false;
        let dataApiDisplay = {};
        for (let i = 0; i < dataApi.length; i++) {
            let empty = dataApi[i];
            for (let j in empty) {
                dataApiDisplay[j.replace("#", ".")] = empty[j];
            }
            for (let j in dataApi[i]) {
                if (dataApi[i][j] === data[email]) {
                    emailDb = true;
                }
                if (dataApi[i][j] === data[password]) {
                    passwordDb = true;
                }
            }
            if (emailDb && passwordDb) {
                if (checkstr.displayInfoUser) {
                    for (let j of checkstr.displayInfoUser) {
                        let inputElementDisplay = formDisplayElement.querySelector(j);
                        inputElementDisplay.value = dataApiDisplay[j];
                    }
                }
                for (let i in checkstr.gender) {
                    if (dataApiDisplay[checkstr.gender.gender] == i) {
                        formDisplayElement.querySelector(checkstr.gender[i]).checked = true;
                    }
                }
                formGroupElement.classList.remove("errchecklimit");
                errorMassageEmail.innerText = "";
                errorMassagePass.innerText = "";
                break;
            }
        }
        if (!emailDb && !passwordDb) {
            formGroupElement.classList.add("errchecklimit");
            errorMassageEmail.innerText = checkstr.errorValueEmail;
            errorMassagePass.innerText = checkstr.errorValuePassword;
        }
        else if (!emailDb) {
            formGroupElement.classList.add("errchecklimit");
            errorMassageEmail.innerText = checkstr.errorValueEmail;
            errorMassagePass.innerText = "";
        }
        else if (!passwordDb) {
            formGroupElement.classList.add("errchecklimit");
            errorMassagePass.innerText = checkstr.errorValuePassword;
            errorMassageEmail.innerText = "";
        }
    });
}

function checkPasswordDb(userApi, data, email, password, confirm_password, passwordNew, checkstr) {
    let formElement = document.querySelector(checkstr.form);
    let errorMassagePass = formElement.querySelector(checkstr.errorMassagePass);
    let formGroupElement = errorMassagePass.parentElement;
    if (data[password]) {
        getUser(userApi, function (dataApi) {
            let passwordDb = false, emailDb = false;
            let dataApiDisplay = {};
            for (let i = 0; i < dataApi.length; i++) {
                let empty = dataApi[i];
                for (let j in empty) {
                    dataApiDisplay[j.replace("#", ".")] = empty[j];
                }
                for (let j in dataApi[i]) {

                    if (dataApi[i][j] === data[password]) {
                        passwordDb = true;
                    }
                    if (dataApi[i][j] === data[email]) {
                        emailDb = true;
                    }
                }
                if (emailDb && passwordDb) {
                    formGroupElement.classList.remove("errchecklimit");
                    errorMassagePass.innerText = "";
                    let updateData = {};
                    for (let i in data) {
                        updateData[i.replace(".", "#")] = data[i];
                    }
                    let pass = password.replace(".", "#");
                    let confirm = confirm_password.replace(".", "#");
                    let passNew = passwordNew.replace(".", "#");
                    for (let i in updateData) {
                        if (i === passNew) {
                            delete updateData[i];
                            updateData[pass] = updateData[confirm];
                            break;
                        }
                    }
                    let inputEmailElement = formElement.querySelector(email);
                    getUser(userApi, function (dataApi) {
                        for (let i = 0; i < dataApi.length; i++) {
                            for (let j in dataApi[i]) {
                                if (dataApi[i][j] === inputEmailElement.value) {
                                    updateUser(dataApi[i]["id"], userApi, updateData);
                                    break;
                                }
                            }
                        }
                    });
                    break;
                }
            }
            if (!passwordDb) {
                formGroupElement.classList.add("errchecklimit");
                errorMassagePass.innerText = checkstr.errorValuePassword;
            }
        });
    }
}

function deleteDataDb(valueControl, formElement) {
    let buttonDeleteElement = formElement.querySelector(valueControl.btnDelete);
    let inputElement = formElement.querySelector(valueControl.email);
    buttonDeleteElement.onclick = (e) => {
        e.preventDefault();
        getUser(valueControl.userApi, function (dataApi) {
            for (let i = 0; i < dataApi.length; i++) {
                for (let j in dataApi[i]) {
                    if (dataApi[i][j] === inputElement.value) {
                        deleteUser(dataApi[i]["id"], valueControl.userApi);
                        break;
                    }
                }
            }
        });
    }
}


function changeInfoUser(changePassElement, formElement, valueControl, btnSubmid) {
    var newRules = valueControl.rules;
    let pass;
    let valueControlArray = {};
    changePassElement.onclick = () => {

        for (let i of valueControl.inputChangePass) {
            let passElement = formElement.querySelector(i);
            let formGroupElement = passElement.parentElement;
            formGroupElement.style.display = "flex";
        }
        newRules = valueControl.rules.concat(valueControl.rulesaddition);
        let arr = newRules.map((rule) => {
            return {
                input: rule.value,
                test: rule.test,
                password: rule.password
            };
        });

        for (let i in arr) {
            if (arr[i].password) {
                pass = arr[i].password;;
            }

            if (Array.isArray(valueControlArray[arr[i].input])) {
                valueControlArray[arr[i].input].push(arr[i].test);
            }
            else {
                valueControlArray[arr[i].input] = [arr[i].test];
            }
        }
        buttonSubmitChange(valueControlArray, valueControl, formElement, btnSubmid, pass, true);
        check(valueControlArray, formElement, valueControl, pass);
        retypeInfo(valueControl, formElement, valueControlArray);

    }
    let arr = newRules.map((rule) => {
        return {
            input: rule.value,
            test: rule.test,
            password: rule.password
        };
    });

    for (let i in arr) {
        if (arr[i].password) {
            pass = arr[i].password;;
        }

        if (Array.isArray(valueControlArray[arr[i].input])) {
            valueControlArray[arr[i].input].push(arr[i].test);
        }
        else {
            valueControlArray[arr[i].input] = [arr[i].test];
        }
    }
    buttonSubmitChange(valueControlArray, valueControl, formElement, btnSubmid, pass, false);
    check(valueControlArray, formElement, valueControl, pass);
    retypeInfo(valueControl, formElement, valueControlArray);
}


function aliveIsmailOrPhone(value, errEmail, errPhone) {
    let formElement = document.querySelector(value.form);
    let checkstrEmail = formElement.querySelector(value.errorMassageEmail);
    let checkstrPhone = formElement.querySelector(value.errorMassagePhone);
    let formGroupElement = checkstrEmail.parentElement;
    if (value.dataEmail === value.strbooleanEmail && value.dataPhone === value.strbooleanPhone) {
        checkstrEmail.innerText = errEmail;
        checkstrPhone.innerText = errPhone;
        formGroupElement.classList.add('errchecklimit');
        return false
    }
    else if (value.dataEmail === value.strbooleanEmail && value.dataPhone !== value.strbooleanPhone) {
        checkstrEmail.innerText = errEmail;
        checkstrPhone.innerText = "";
        formGroupElement.classList.add('errchecklimit');
        return false
    }
    else if (value.dataEmail !== value.strbooleanEmail && value.dataPhone === value.strbooleanPhone) {
        checkstrPhone.innerText = errPhone;
        checkstrEmail.innerText = "";
        formGroupElement.classList.add('errchecklimit');
        return false
    }
    else {
        checkstrPhone.innerText = "";
        checkstrEmail.innerText = "";
        formGroupElement.classList.remove('errchecklimit');
        return true;
    }
}

function check(valueControlArray, formElement, valueControl, pass) {
    for (let i in valueControlArray) {
        let inputElement = formElement.querySelector(i);
        let formgroupElement = inputElement.parentElement;
        let errorElement = formgroupElement.querySelector(valueControl.errorMassage);
        let confirmPasswordElement = formElement.querySelector(pass);

        inputElement.onblur = () => {
            for (let j = 0; j < valueControlArray[i].length; j++) {
                if (confirmPasswordElement) {
                    if (valueControlArray[i][j](inputElement.value, confirmPasswordElement.value)) {
                        formgroupElement.classList.add('error');
                        if (errorElement) {
                            errorElement.innerText = valueControlArray[i][j](inputElement.value, confirmPasswordElement.value);
                        }
                        break;
                    }
                }
                else {
                    if (valueControlArray[i][j](inputElement.value)) {
                        formgroupElement.classList.add('error');
                        if (errorElement) {
                            errorElement.innerText = valueControlArray[i][j](inputElement.value);
                        }
                        break;
                    }
                }
            }
        }
        inputElement.oninput = () => {
            formgroupElement.classList.remove('error');
            if (errorElement) {
                errorElement.innerText = "";
            }
        }
    }
}




validation.isRequired = (value, errorText) => {
    return {
        value,
        test: (data) => {
            return data ? undefined : errorText;
        }
    };
}

validation.isEmail = (value, errorText) => {
    return {
        value,
        test: (data) => {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data) ? undefined : errorText;
        }
    };
}

validation.isLimit = (value, errorText, min, max) => {
    return {
        value,
        test: (data) => {
            return data.length >= min && data.length <= max ? undefined : errorText;
        }
    };
}

validation.isPhone = (value, errorText) => {
    return {
        value,
        test: (data) => {
            return Number(data) ? undefined : errorText;
        }
    };
}

validation.isConfirmPassword = (value, password, errorText) => {
    return {
        value,
        password,
        test: (data, confirm) => {
            return data === confirm ? undefined : errorText;
        }
    };
}

function getUser(url, callback) {
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(callback);
}

function createUser(dataApi, url, callback) {
    let option = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataApi)
    };
    fetch(url, option)
        .then((response) => {
            return response.json();
        })
        .then(callback);
}

function deleteUser(id, url) {
    let option = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    };
    fetch(url + "/" + id, option);
}

function updateUser(id, url, dataApi) {
    let option = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataApi)
    };
    fetch(url + "/" + id, option);
}