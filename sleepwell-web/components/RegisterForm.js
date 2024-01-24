//registerform

import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useRef, useEffect, useState } from "react";
import { MdCheckBox, MdVisibility, MdVisibilityOff } from "react-icons/md";
import db from "../components/Firebase";

export default function RegisterForm(props) {
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const genderRef = useRef();
    const ageRef = useRef();
    const countryRef = useRef();
    const timezoneRef = useRef();
    const confirmPassRef = useRef();
    const isCheckedRef = useRef();
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [user, setUser] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [exists, setExists] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const ageOptions = [
        "16-20", "21-25", "25-30", "31-35", "35-40", "41-45", "46-50",
        "51-55", "56-70", "71-75", "76-80", "81-85", "86-90", "91-95",
        "96-100", "101-105", "106-110", "Decline to state"
        ];

    const togglePass = () => {
        setShowPass(!showPass);
    };
    const toggleConfirmPass = () => {
        setShowConfirmPass(!showConfirmPass);
    };

    function submitHandler(event) {
        event.preventDefault();

        //Read the values
        const { current: { value: firstName } } = firstNameRef;
        const { current: { value: lastName } } = lastNameRef;
        const { current: { value: email } } = emailRef;
        const { current: { value: password } } = passwordRef;
        const { current: { value: confirmPass } } = confirmPassRef;
        const { current: { value: gender } } = genderRef;
        const { current: { value: age } } = ageRef;
        const { current: { value: timezone } } = timezoneRef;
        const { current: { value: country } } = countryRef;
        const reminder = isCheckedRef.current.checked;

        setUser({firstName, lastName, email, password, confirmPass, gender, age, timezone, country, reminder });

        // Check for errors
        setErrors(errorCheck(email, password, confirmPass, firstName, lastName, age));

        setSubmitted(true);
    }


    async function existsCheck(email) {
        var res = false;
        // query the database to see if user document with email exists
        const q = query(collection(db, "users"), where("email", "==", email));

        await getDocs(q).then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if (doc.exists) {
                    res = true;
                }
            });
        });

        return res;
    }


    function handleCheckboxChange(event) {
        setChecked(event.target.checked);
    }
    


    function errorCheck(email, password, confirmPass, firstName, lastName, age) {
        const errorList = {};

        // call existsCheck to get boolean if email exists
        existsCheck(email).then(function (result) {
            if (result) {
                errorList.email = "An account with this email already exists";
            } else {
                errorList.email = null;
            }
            setExists(result);
        });

        // regex for only allowing letters
        const letterReg = new RegExp(/^[A-Za-z]+$/);
        // regex for only allowing valid emails
        const emailReg = new RegExp(
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
        // regex for only allowing strong password
        const passReg = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[`~!@$%^&*()_\-+=<>.?:"{}]).{8,16}$/;
        //regex for only allowing numbers
        const intReg =  new RegExp(/^[0-9]+$/);
        
        // Error for if First Name is empty
        if(!firstName){
            errorList.firstName = "First Name is Required";
        }
        // Error for if First name is invalid   
        else if(!letterReg.test(firstName)){
            errorList.firstName = "Invalid First Name";
        }

        // Error for if Last Name is empty
        if(!lastName){
            errorList.LastName = "Last Name is Required";
        }
        // Error for if Last name is invalid   
        else if(!letterReg.test(lastName)){
            errorList.LastName = "Invalid Last Name";
        }

        // Error for if age is invalid   
        else if(!intReg.test(age)){
            errorList.age = "Invalid Age";
        }



        // Error for if email name is empty
        if (!email) {
            errorList.email = "Email is required";
        }
        // Error for if email name is invalid
        else if (!emailReg.test(email)) {
            errorList.email = "Invalid email";
        }
        // Error for if a user with email already exists
        if (exists) {
            errorList.email = "An account with this email already exists";
        }

        // Error for if password is empty
        if (!password) {
            errorList.pass = "Password is required";
        }
        // Error for if password is weak
        else if (!passReg.test(password)) {
            errorList.pass =
                "passwords must contain both upper and lower case letters, numbers, and special symbols, and be at least eight characters long";
        }

        // Error for if confirm password is empty
        if (!confirmPass) {
            errorList.confirmPass = "Confirm password is required";
        } else if (confirmPass !== password) {
            errorList.matchPass = "Passwords do not match";
        }

        return errorList;
    }

    // register user
    function registerHandler() {
        props.registerUser(user);
    }

    // if there are no errors and the form has been submitted, show the modal
    useEffect(() => {
        if (Object.keys(errors).length === 0 && submitted) {
            setShowModal(true)
        }
    }, [errors]);


    return (

        <form className="w-full m-12">

            <p className="mb-12 text-3xl xl:text-5xl text-center">Register</p>

            <div className="mb-1 xl:mb-6">
                <label htmlFor="firstName" className="m-2 text-base xl:text-3xl ">
                    First Name
                </label>
                <input
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    type="firstName"
                    name="firstName"
                    placeholder="First Name"
                    ref={firstNameRef}
                />
                <p className="p-2 text-red-500">{errors.firstName}</p>
            </div>

            <div className="mb-1 xl:mb-6">
                <label htmlFor="lastName" className="m-2 text-base xl:text-3xl ">
                    Last Name
                </label>
                <input
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    type="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    ref={lastNameRef}
                />
                <p className="p-2 text-red-500">{errors.LastName}</p>
                
            </div>

            <div className="mb-1 xl:mb-6">
                <label htmlFor="email" className="m-2 text-base xl:text-3xl ">
                    Email
                </label>
                <input
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    type="email"
                    name="email"
                    placeholder="Email"
                    ref={emailRef}
                />
                <p className="p-2 text-red-500">{errors.email}</p>
            </div>

            <div className="mb-1 xl:mb-6">
                <label htmlFor="gender" className="m-2 text-base xl:text-3xl">
                    Sex
                </label>
                <select
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    name="gender"
                    ref={genderRef}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Decline to state">Decline to state</option>

                </select>
                <p className="p-2 text-red-500">{errors.gender}</p>
            </div>

            <div className="mb-1 xl:mb-6">
                <label htmlFor="age" className="m-2 text-base xl:text-3xl">
                    Age
                </label>

                <input
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    type="age"
                    name="age"
                    placeholder="Age"
                    ref={ageRef}
                />
                <p className="p-2 text-red-500">{errors.age}</p>

            </div>


            <div className=" mb-1 xl:mb-6">
                <label htmlFor="age" className="m-2 text-base xl:text-3xl">
                    Country
                </label>
                <select
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    name="country"
                    ref={countryRef}>
                    <option value="Canada" default>Canada</option>
                    <option value="Decline to state">Decline to state</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Andorra">Andorra</option>
                    <option value="Angola">Angola</option>
                    <option value="ANGUILLA(U.K.)">ANGUILLA(U.K.)</option>
                    <option value="Antigua & Barbuda">Antigua & Barbuda</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Aruba">Aruba</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahrian">Bahrian</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Belize">Belize</option>
                    <option value="Benin">Benin</option>
                    <option value="Bermuda">Bermuda</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bonaire">Bonaire</option>
                    <option value="Bosnia&Hercegovina">Bosnia&Hercegovina</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Br. Virgin Is">Br. Virgin Is</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Byelorussia">Byelorussia</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Canada">Canada</option>
                    <option value="Canary Is">Canary Is</option>
                    <option value="Cape Verde">Cape Verde</option>
                    <option value="Cayman Is">Cayman Is</option>
                    <option value="Central African Rep.">Central African Rep.</option>
                    <option value="Ceuta">Ceuta</option>
                    <option value="Chad">Chad</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo">Congo</option>
                    <option value="Congo,DR">Congo,DR</option>
                    <option value="Cook Is">Cook Is</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Cote d'lvoir">Cote d'lvoir</option>
                    <option value="Croatia Rep">Croatia Rep</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Curacao">Curacao</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Czech Rep">Czech Rep</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Dominican Rep.">Dominican Rep.</option>
                    <option value="East Timor">East Timor</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Egypt">Egypt</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Eq.Guinea">Eq.Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Fiji">Fiji</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="French Guyana">French Guyana</option>
                    <option value="French Polynesia">French Polynesia</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Gambier Is">Gambier Is</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Gibraltar">Gibraltar</option>
                    <option value="Greece">Greece</option>
                    <option value="Greenland">Greenland</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Guadeloupe">Guadeloupe</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guinea Bissau">Guinea Bissau</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Iran">Iran</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kirghizia">Kirghizia</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Korea Rep.">Korea Rep.</option>
                    <option value="Korea,DPR">Korea,DPR</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Laos,PDR">Laos,PDR</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libyan Arab Jm">Libyan Arab Jm</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Macau">Macau</option>
                    <option value="Macedonia Rep">Macedonia Rep</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marquesas Is">Marquesas Is</option>
                    <option value="Marshall Is Rep">Marshall Is Rep</option>
                    <option value="Martinique">Martinique</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mayotte">Mayotte</option>
                    <option value="Melilla">Melilla</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Micronesia Fs">Micronesia Fs</option>
                    <option value="Moldavia">Moldavia</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="NETHERLANDS ANTILLES">NETHERLANDS ANTILLES</option>
                    <option value="New Caledonia">New Caledonia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Norfolk Is">Norfolk Is</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Oth. Afr. nes">Oth. Afr. nes</option>
                    <option value="Oth. Asia nes">Oth. Asia nes</option>
                    <option value="Oth. Eur. nes">Oth. Eur. nes</option>
                    <option value="Oth. L.Amer. nes">Oth. L.Amer. nes</option>
                    <option value="Oth. N.Amer. nes">Oth. N.Amer. nes</option>
                    <option value="Oth. Ocean. nes">Oth. Ocean. nes</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau">Palau</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Puerto Rico">Puerto Rico</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Republic of Yemen">Republic of Yemen</option>
                    <option value="Reunion">Reunion</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="S.Africa">S.Africa</option>
                    <option value="Saba">Saba</option>
                    <option value="Saint Lucia">Saint Lucia</option>
                    <option value="Saint Martin Is">Saint Martin Is</option>
                    <option value="Saint Vincent & Grenadines">Saint Vincent & Grenadines</option>
                    <option value="Samoa">Samoa</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome & Principe">Sao Tome & Principe</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Serbia & Montenegro">Serbia & Montenegro</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovak Rep">Slovak Rep</option>
                    <option value="Slovenia Rep">Slovenia Rep</option>
                    <option value="Society Is">Society Is</option>
                    <option value="Solomon Is">Solomon Is</option>
                    <option value="Somalia">Somalia</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="St. Kitts-Nevis">St. Kitts-Nevis</option>
                    <option value="ST. LUCIA">ST. LUCIA</option>
                    <option value="ST. VINCENT AND THE GRENADINES">ST. VINCENT AND THE GRENADINES</option>
                    <option value="St.Pierre and Miquelon">St.Pierre and Miquelon</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Swaziland">Swaziland</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syrian">Syrian</option>
                    <option value="Tadzhikistan">Tadzhikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="the Netherlands Antilles">the Netherlands Antilles</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad & Tobago">Trinidad & Tobago</option>
                    <option value="Tuamotu Is">Tuamotu Is</option>
                    <option value="Tubai Is">Tubai Is</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Turks & Caicos Is">Turks & Caicos Is</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Uzbekstan">Uzbekstan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City State">Vatican City State</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="VIRGIN IS.(U.K.)">VIRGIN IS.(U.K.)</option>
                    <option value="VIRGIN IS.(US)">VIRGIN IS.(US)</option>
                    <option value="Wallis and Futuna">Wallis and Futuna</option>
                    <option value="Western Sahara">Western Sahara</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                </select>
                <p className="p-2 text-red-500">{errors.country}</p>
            </div>

            <div className="mb-1 xl:mb-6">
                <label htmlFor="timezone" className="m-2 text-base xl:text-3xl">
                    Timezone
                </label>
                <select

                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    name="timezone"
                    ref={timezoneRef}>

                    <option value="AST">Atlantic Standard Time (UTC -04:00)</option>
                    <option value="HST">Hawaii-Aleutian Standard Time (UTC -10:00)</option>
                    <option value="AKST">Alaska Standard Time (UTC -09:00)</option>
                    <option value="PST">Pacific Standard Time (UTC -08:00)</option>
                    <option value="MST">Mountain Standard Time (UTC -07:00)</option>
                    <option value="CST">Central Standard Time (UTC -06:00)</option>
                    <option value="EST">Eastern Standard Time (UTC -05:00)</option>
                    <option value="NST">Newfoundland Standard Time (UTC -03:30)</option>
                    <option value="GMT">Greenwich Mean Time (UTC +0:00)</option>
                    <option value="CET">Central European Time (UTC +01:00)</option>
                    <option value="EET">Eastern European Time (UTC +02:00)</option>
                    <option value="MSK">Moscow Standard Time (UTC +03:00)</option>
                    <option value="IST">Indian Standard Time (UTC +05:30)</option>
                    <option value="ICT">Indochina Time (UTC +07:00)</option>
                    <option value="CST (China)">China Standard Time (UTC +08:00)</option>
                    <option value="JST">Japan Standard Time (UTC +09:00)</option>
                    <option value="ACDT">Australian Central Daylight Time (UTC +10:30)</option>
                    <option value="AEST">Australian Eastern Standard Time (UTC +10:00)</option>
                    <option value="NZDT">New Zealand Daylight Time (UTC +13:00)</option>
                </select>
            
            </div>

            <div className="relative mb-1 xl:mb-6">
                <label htmlFor="pass" className="m-2 text-base xl:text-3xl">
                    Password
                </label>
                <input
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    type={showPass === false ? "password" : "text"}
                    name="pass"
                    placeholder="Password"
                    ref={passwordRef}
                />

                {showPass ? (
                    <button type="button">
                        <MdVisibility
                            className="absolute text-black top-12 right-7"
                            onClick={togglePass}
                        />
                    </button>
                ) : (
                    <button type="button">
                        <MdVisibilityOff
                            className="absolute text-black top-12 right-7"
                            onClick={togglePass}
                        />
                    </button>
                )}

                <p className="p-2 text-red-500">{errors.pass}</p>
            </div>

            <div className="relative xl:mb-6">
                <label htmlFor="confirmPass" className="justify-start m-2 text-start text-base xl:text-3xl">
                    Confirm Password
                </label>
                <input
                    className="w-full p-2 mt-2 text-black bg-gray-200 rounded-lg text-base xl:text-2xl"
                    type={showConfirmPass === false ? "password" : "text"}
                    name="confirmPass"
                    placeholder="Confirm Password"
                    ref={confirmPassRef}
                />
                {showConfirmPass ? (
                    <button type="button">
                        <MdVisibility
                            className="absolute text-black top-12 right-7"
                            onClick={toggleConfirmPass}
                        />
                    </button>
                ) : (
                    <button type="button">
                        <MdVisibilityOff
                            className="absolute text-black top-12 right-7"
                            onClick={toggleConfirmPass}
                        />
                    </button>
                )}
                <p className="flex float-left w-6/12 p-2 mb-6 text-red-500">
                    {errors.confirmPass} {errors.matchPass}
                </p>
            </div>
            <div className="pt-4">
                <label className="text-base xl:text-3xl flex items-center" style={{ lineHeight: '1.5rem' }}>
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} ref={isCheckedRef} style={{ transform: 'scale(1.5)', marginRight: '30px' }} />
                    <span className="xl:text-3xl inline-block ml-2" style={{ marginLeft: 0 }}>Send me daily email reminders to complete my diary entry</span>
                </label>
            </div>

            <button
                type="submit"
                className="w-full p-2 xl:mt-12  xl:mb-6 rounded-lg bg-swCyan text-base xl:text-2xl"
                onClick={submitHandler}
            >
                Create account
            </button>
            <p className="mt-6 text-base xl:text-2xl">
                Already have an account?{" "}
                <a href="/login" className="underline text-swCyan ">
                    Log in now
                </a>
            </p>

            {
                showModal && (
                    <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full bg-swDarkGray bg-opacity-80">
                        <div className="relative w-full h-full mx-auto max-w-2xl mt-40 md:h-auto">
                            <div className="relative bg-white rounded-lg shadow border border-gray-600 dark:bg-swDarkGray">
                                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        Privacy statement
                                    </h3>
                                    <button type="button" className="text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="defaultModal" onClick={() => setShowModal(false)}>
                                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <p className="text-base leading-relaxed text-gray-800 dark:text-white">
                                        You privacy is our highest priority. We do not collect your name, address, or health information. We do ask you to provide basic information so that we can understand who is using Sleepwell's Sleep Therapy program. After you have completed the program, you will be asked to give us feedback about the program so we can improve it.
                                    </p>
                                </div>
                                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                                    <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-swCyan dark:hover:bg-sky-700 dark:focus:ring-sky-800" onClick={registerHandler}>I accept</button>
                                    <button type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600" onClick={() => setShowModal(false)}>Decline</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </form>
    );
}

