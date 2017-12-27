import React from "react";
import "whatwg-fetch";
require("es6-promise").polyfill();

const API_KEY = "a333333O6666hHD44444e30555B6r7bko";
const Russian = require("flatpickr/dist/l10n/ru.js").ru;
const HOST_URL = https://private_url.pl/api/Salon/Diagnoses/

export default class BrandDaysSalon extends React.Component {
    constructor() {
        super();
        this.state = {
            SingleSalonData: {},
            PhoneNumber: "",
            ShowPhoneText: "показать телефон",
            Diagnoses: [],
            ActiveDiagnoseDate: ""
        };
    }
    componentWillMount() {
        this.generateScriptTag();

        let DIAGNOSE_ID = parseInt(window.location.href.split("/").slice(-1)[0], 10);
        let SALON_ID = window.location.href.split("/").slice(-2)[0];

        fetch(HOST_URL + SALON_ID, {
            method: "get",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
        .then((response) => {
            return response.json();
        }).then((json) => {

            this.setState({
                "SingleSalonData": json,
                "PhoneNumber": json.PhoneNumber1.slice(0, 4),
                "Diagnoses": json.Diagnoses
            }, () => {

                let diagnseDate = this.state.Diagnoses.filter(diagnose => {

                    if (diagnose.DiagnoseId === DIAGNOSE_ID) {
                        return diagnose;
                    }
                });

                this.setState({
                    "ActiveDiagnoseDate": diagnseDate[0].Date
                });

            });
        });
    }
    componentDidMount() {
        setTimeout(() => {
            let map = new google.maps.Map(document.getElementById("map-location"), { // eslint-disable-line
                zoom: 18,
                center: {lat: this.state.SingleSalonData.Latitude, lng: this.state.SingleSalonData.Longitude},
                scrollwheel: true,
                navigationControl: true,
                scaleControl: true,
                draggable: true
            });
            let marker = new google.maps.Marker({ // eslint-disable-line
                position: {lat: this.state.SingleSalonData.Latitude, lng: this.state.SingleSalonData.Longitude},
                map: map
            });
            let infowindow = new google.maps.InfoWindow({ // eslint-disable-line
                content: "<div>" + "<b>" + this.state.SingleSalonData.Name + "</b>" + "<br />" + this.state.SingleSalonData.Address + ", " + this.state.SingleSalonData.City + "</div>"
            });
            marker.addListener("click", function () {
                infowindow.open(map, marker);
            });

        }, 1000);
    }
    generateScriptTag = () => {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        document.body.appendChild(script);
    }
    hashPhoneNumber = (event) => {
        event.preventDefault();
        this.setState({
            "PhoneNumber": this.state.SingleSalonData.PhoneNumber1,
            "ShowPhoneText": ""
        });
    }
    generateMonthName = (diagnoseDate) => {
        var diagnoseMonth = diagnoseDate.getMonth() + 1;
        var RussianMonths = Russian.months.longhand;

        let translatedMonth = RussianMonths.filter((monthName, index) => {
            if ((index + 1) === diagnoseMonth) {
                return monthName;
            }
        });

        return translatedMonth[0];
    }
    generateDayName = (diagnoseDate) => {
        var diagnoseDay = diagnoseDate.getDay();
        var RussianDays = Russian.weekdays.longhand;

        let translatedDays = RussianDays.filter((dayName, index) => {
            if (index === diagnoseDay) {
                return dayName;
            }
        });

        return translatedDays[0];
    }
    render() {
        let day = new Date(this.state.ActiveDiagnoseDate);
        let dayNumber = day.getDay() + 1;
        return (
            <div>
                <section className="header">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <img src="/i/brand_days.png" alt="Brand Days" />
                                <div className="date">
                                    {this.state.ActiveDiagnoseDate && (<div>
                                        <b className="day">{ parseInt(dayNumber, 10) }</b>
                                        <span className="month">{ this.generateMonthName(day) }</span>
                                        <span className="day-name">{ this.generateDayName(day) }</span>
                                    </div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="content">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-9 col-md-7">
                                <h1 className="title">ДЕНЬ БРЕНДА<br />В День Бренда Вас ждут:</h1>
                                <div className="description">
                                    <ul>
                                        <li>персональная консультация экспертов бренда</li>
                                        <li>эксклюзивная mapping-диагностика состояния волос и кожи головы</li>
                                        <li>роскошные спа-процедуры</li>
                                        <li>праздничная атмосфера</li>
                                        <li>комплименты от бренда</li>
                                    </ul>

                                    <br />

                                    <p>
                                    Узнайте свой персональный EnergyCode и погрузитесь в мир люксового селективного ухода за волосами.
                                    Подробности акции уточняйте у администратора по телефону. Предварительная запись обязательна.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-5">
                                <div className="salon-info">
                                    <img src="\m\sprites\logo-mobile.png" alt="" />
                                    <h3>{ this.state.SingleSalonData.Name }</h3>
                                    <ul>
                                        <li className="phone">Телефон: <span className="">{ this.state.PhoneNumber }</span><a href="#" className="show-number" onClick={(event) => this.hashPhoneNumber(event)}>{this.state.ShowPhoneText}</a></li>
                                        <li className="address">Адрес: <span> { this.state.SingleSalonData.City }, { this.state.SingleSalonData.AddressLine1 }</span></li>
                                        {this.state.SingleSalonData.Email && (
                                            <li className="email">Email: <a href={"mailto:" + this.state.SingleSalonData.Email}>{ this.state.SingleSalonData.Email }</a></li>
                                        )}
                                    </ul>
                                    {this.state.SingleSalonData.WebsiteUrl && (
                                        <a className="salon-link button-primary" href={this.state.SingleSalonData.WebsiteUrl}>Перейти на сайт салона</a>
                                    )}
                                </div>
                                <div className="map">
                                    <div className="map-container" id="MapPanel">
                                        <div className="googleMap" id="map-location"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
