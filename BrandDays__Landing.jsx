import React from "react";
import $ from "jquery";
import "jquery.scrollto";
import "whatwg-fetch";
require("es6-promise").polyfill();

const flatpickr = require("flatpickr");
const Russian = require("flatpickr/dist/l10n/ru.js").ru;
const $window = $(window);

//componets
import SalonsRender from "./Landing/salonsRender";

const HOST_URL = "https://url.com";
const API_KEY = "a333333O6666hHD44444e30555B6r7bko";
const DEFAULT_CITY = "Пермь"; // eslint-disable-line

const currentDate = new Date();
const CURRENT_MONTH = parseInt(currentDate.getMonth() + 1, 10);

const MOBILE_WIDTH = 767;  // 0 - 767
const TABLET_WIDTH = 768;  // 768 - 980
const DESKTOP_WIDTH = 1025; // 1025 - oo

export default class BrandDaysLanding extends React.Component {
    constructor() {
        super();

        this.state = {
            selectedCity: DEFAULT_CITY,
            selectedMonth: CURRENT_MONTH,
            selectedYear: 2017,
            SalonsData: [],
            CorrectlyDiagnosesData: [],
            salonsMapMarkers: [],
            errorMonth: false,
            errorCity: false,
            isPageDataWillMount: true,
            isFormSubmitted: false,
            DiagnosesAllDates: [],
            isFiltered: false,
            IsMobile: false,
            IsTablet: false,
            IsDesktop: false,
            isTabSalonActive: true,
            isTabMapActive: false,
            clickedSalonCoordinates: {},
            selectDates: [
                {id: "2017-09", text: "Сентябрь 2017"}, {id: "2017-10", text: "Октябрь 2017"}, {id: "2017-11", text: "Ноябрь 2017"}, {id: "2017-12", text: "Декабрь 2017"}, {id: "2018-01", text: "Январь 2018"}, {id: "2018-02", text: "Февраль 2018"}, {id: "2018-03", text: "Март 2018"}, {id: "2018-04", text: "Апрель 2018"}, {id: "2018-05", text: "Май 2018"}, {id: "2018-06", text: "Июнь 2018"}, {id: "2018-07", text: "Июль 2018"}, {id: "2018-08", text: "Август 2018"}, {id: "2018-09", text: "Сентябрь 2018"}, {id: "2018-10", text: "Октябрь 2018"}, {id: "2018-11", text: "Ноябрь 2018"}, {id: "2018-12", text: "Декабрь 2018"}
            ]
        };
    }
    componentWillMount() {
        this.generateAndAppendScript();

        this.setState({
            "IsMobile": window.innerWidth <= MOBILE_WIDTH,
            "IsTablet": window.innerWidth >= TABLET_WIDTH && window.innerWidth < DESKTOP_WIDTH,
            "IsDesktop": window.innerWidth >= DESKTOP_WIDTH
        });

        fetch(`${HOST_URL}month=${this.state.selectedMonth}&year=${this.state.selectedYear}&city=${this.state.selectedCity}`, {
            method: "get",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
        .then((response) => {
            return response.json();
        }).then((json) => {

            this.generateUniqueDays(json);

        });
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }
    componentDidMount() {
        window.addEventListener("resize", this.handleWindowResize);
        // selected corect month on page load
        document.getElementById("monthSelectId").getElementsByTagName("option")[this.state.selectedMonth - 1].selected = "selected";
    }
    getSalonsMapMarkers = (json) => {
        var markers = [];
        json.map(salon => {
            markers.push({"lat": salon.Latitude, "lng": salon.Longitude, "SalonName": salon.Name, "Address": salon.AddressLine1, "City": salon.City});
            return markers;
        });

        this.setState({
            salonsMapMarkers: markers
        }, () => {
            setTimeout(() => {
                this.generateMap(this.state.salonsMapMarkers);
            }, 500);
        });
    }
    generateMap = (salonsMapMarkers, clickedSalonCoordinates) => {
        let firstSalonInList = {"lat": salonsMapMarkers[0].lat, "lng": salonsMapMarkers[0].lng};

        if (clickedSalonCoordinates) {
            this.setState({
                "clickedSalonCoordinates": clickedSalonCoordinates
            });
        }

        let map = new google.maps.Map(document.getElementById("map-location"), { // eslint-disable-line
            zoom: clickedSalonCoordinates ? 18 : 12,
            center: clickedSalonCoordinates ? clickedSalonCoordinates : firstSalonInList,
            scrollwheel: true,
            navigationControl: true,
            scaleControl: true,
            draggable: true
        });

        salonsMapMarkers.map((salonMarker) => {
            let marker = new google.maps.Marker({ // eslint-disable-line
                position: salonMarker,
                map: map
            });
            let infowindow = new google.maps.InfoWindow({ // eslint-disable-line
                content: "<div>" + "<b>" + salonMarker.SalonName + "</b>" + "<br />" + salonMarker.Address + ", " + salonMarker.City + "</div>"
            });
            marker.addListener("click", function () {
                infowindow.open(map, marker);
            });
        });

    }
    generateAndAppendScript = () => {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        document.body.appendChild(script);
    }
    forumSubitted = (event) => {
        event.preventDefault();

        this.setState({
            "isFormSubmitted": true
        });

        if (!this.state.selectedMonth || this.state.selectedCity === "") {

            if (!this.state.selectedMonth) {
                this.setState({"errorMonth": true});
                return;
            } else if (this.state.selectedCity === "") {
                this.setState({"errorCity": true});
                return;
            }

            return;
        }

        fetch(`${HOST_URL}month=${this.state.selectedMonth}&year=${this.state.selectedYear || "2017"}&city=${this.state.selectedCity }`, {
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
                "errorMonth": false,
                "errorCity": false
            });
            this.generateUniqueDays(json);
        });
    }
    generateUniqueDays = (json) => {
        var DiagnosesAllDates = [];
        json.map(salon => {
            return salon.Diagnoses.forEach((diagnoses) => {
                if (DiagnosesAllDates.indexOf(diagnoses.Date) === -1) {
                    DiagnosesAllDates.push(diagnoses.Date);
                }
            });
        });

        this.setState({
            SalonsData: json,
            CorrectlyDiagnosesData: DiagnosesAllDates
        }, () => {
            this.renderCalendarWidget(this.state.CorrectlyDiagnosesData);
            this.getSalonsMapMarkers(this.state.SalonsData);
        });
    }
    renderCalendarWidget = (dayOfDiagnosesArray) => {
        var FLATPICKR__CONFIG = {
            locale: Russian,
            inline: true,
            disable: [
                {
                    from: "2016-01-01",
                    to: "2020-01-01"
                }
            ],
            enable: dayOfDiagnosesArray,
            onChange: function (selectedDates, dateStr) {
                $window.scrollTo($("#day_" + String(dateStr)), 1000, {"offset": {"top": -130}});
            }
        };

        // START DEFAULT CALENDAR
        flatpickr("#flatpickr-tryme", FLATPICKR__CONFIG);

        // CREATE NEW CALENDAR WITH SELECTED MONTH
        let calendar = new flatpickr("#flatpickr-tryme", FLATPICKR__CONFIG);
        calendar.changeMonth(this.state.selectedMonth - 1, false);
    }
    handleCity = (event) => {
        this.setState({
            "selectedCity": event.target.value
        });
    }
    handleMonth = (event) => {
        this.setState({
            "selectedMonth": parseInt(event.target.value.split("-")[1], 10),
            "selectedYear": parseInt(event.target.value.split("-")[0], 10)
        }, () => {
            console.log("selectedMonth: ", this.state.selectedMonth);
        });
    }
    handleWindowResize = () => {
        this.setState({
            "IsMobile": window.innerWidth <= MOBILE_WIDTH,
            "IsTablet": window.innerWidth >= TABLET_WIDTH && window.innerWidth < DESKTOP_WIDTH,
            "IsDesktop": window.innerWidth >= DESKTOP_WIDTH
        }, () => {
            if (this.state.clickedSalonCoordinates) {
                this.generateMap(this.state.salonsMapMarkers, this.state.clickedSalonCoordinates);
            }
        });
    }
    showSalonTab = (event) => {
        event.preventDefault();
        if (!this.state.IsDesktop) {
            this.setState({
                "isTabSalonActive": true,
                "isTabMapActive": false
            });
        }
    }
    showMapTab = (event) => {
        event.preventDefault();
        if (!this.state.IsDesktop) {
            this.setState({
                "isTabMapActive": true,
                "isTabSalonActive": false
            }, () => {
                setTimeout(() => {
                    this.generateMap(this.state.salonsMapMarkers);
                }, 200);
            });
        }
    }
    handleMobile = (isSalonActive, isMapActive, coords) => {
        this.setState({
            "isTabSalonActive": isSalonActive,
            "isTabMapActive": isMapActive
        }, () => {
            setTimeout(() => {
                this.generateMap(this.state.salonsMapMarkers, coords);
            }, 200);
        });
    }
    render() {
        return (
            <div>
                <section className="header">
                    <div className="container">
                        <div className="row" style={{"position": "relative"}}>
                            <img src="/i/brand_days.png" alt="Brand Days" />
                        </div>
                    </div>
                </section>

                <section className="content">
                    <div className="container">

                        <div className="row">
                            <div>
                                <h1 className="title">УЗНАЙ СВОЙ ENERGYCODE<br />
                                МЕСЯЦ <b>ПЕРСОНАЛЬНОЙ ДИАГНОСТИКИ</b></h1>
                            </div>
                            <div className="col-lg-8 col-lg-offset-2">
                                <form onSubmit={this.forumSubitted} className="brand-days-form" action="#" method="post">
                                    <input type="text" placeholder={this.state.errorCity ? "введите название города" : ""} onChange={this.handleCity} value={this.state.selectedCity} id="city" className={this.state.errorCity ? "long errorCity" : "long"} />
                                    <select id="monthSelectId" onChange={this.handleMonth} className={this.state.errorMonth ? "short errorMonth" : "short"}>
                                        {this.state.selectDates.map((month, index) => {
                                            //var currentMonth = 9 + index;

                                            return <option key={index} value={month.id}>{month.text}</option>;
                                        })}
                                    </select>
                                    <button onClick={this.forumSubitted} type="submit" className="button-primary">найти</button>
                                </form>
                            </div>

                            <div className="buttons">
                                <a href="#" onClick={(event) => this.showSalonTab(event)} className={this.state.isTabSalonActive ? "button salons active" : "button salons"}>Список салонов</a>
                                <a href="#" onClick={(event) => this.showMapTab(event)} className={this.state.isTabMapActive ? "button map active" : "button map"}>Карта</a>
                            </div>

                        </div>

                        <div className="row">

                            {/*  SALONS LIST  */}
                            {/*  SALONS LIST  */}
                            {/*  SALONS LIST  */}
                            {(this.state.isTabSalonActive || this.state.IsDesktop) && (
                                <div className="salon-list col-sm-12 col-md-6 col-lg-4 col-lg-offset-2">
                                    <SalonsRender
                                        CorrectlyDiagnosesData={this.state.CorrectlyDiagnosesData}
                                        SalonsData={this.state.SalonsData}
                                        convertMonthNumberToTranslatedWord={this.convertMonthNumberToTranslatedWord}
                                        getDayFromDate={this.getDayFromDate}
                                        salonsMapMarkers={this.state.salonsMapMarkers}
                                        generateMap={this.generateMap}
                                        IsDesktop={this.state.IsDesktop}
                                        handleMobile={this.handleMobile}
                                    />
                                </div>
                            )}

                            <div className="col-sm-12 col-md-6 col-lg-4">


                                {/*  CALENDAR  */}
                                {/*  CALENDAR  */}
                                {/*  CALENDAR  */}
                                <div className="callendar">
                                    <h3>БЛИЖАЙШИЕ ДНИ бренда</h3>
                                    <div className="callendar-container">
                                        <input type="hidden" id="flatpickr-tryme" />
                                    </div>
                                </div>

                                {/*  MAP  */}
                                {/*  MAP  */}
                                {/*  MAP  */}
                                {(this.state.isTabMapActive || this.state.IsDesktop) && (
                                    <div className="salon-map" id="MapPanel">
                                        <h3>РАСПОЛОЖЕНИЕ САЛОНОВ</h3>
                                        <div className="map-container">
                                           <div className="googleMap" id="map-location"></div>
                                        </div>
                                    </div>
                                )}


                            </div>

                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
