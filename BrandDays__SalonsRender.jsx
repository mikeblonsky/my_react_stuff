import React from "react";
import $ from "jquery";
import "jquery.scrollto";

const Russian = require("flatpickr/dist/l10n/ru.js").ru;
const $window = $(window);

export default class SalonsRender extends React.Component {
    constructor() {
        super();
    }
    generateDateId = (newDate) => {
        var monthFormat;
        var correctMonth = newDate.getMonth() + 1;

        if (correctMonth > 9) {
            monthFormat = correctMonth;
        } else {
            monthFormat = "0" + correctMonth;
        }

        return "day_" + newDate.getFullYear() + "-" + monthFormat + "-0" + newDate.getDate();
    }
    generateMonthName = (diagnoseDate) => {
        var diagnoseMonth = diagnoseDate.getMonth() + 1;
        var RussianMonths = Russian.months.shorthand;

        let translatedMonth = RussianMonths.filter((monthName, index) => {
            if ((index + 1) === diagnoseMonth) {
                return monthName;
            }
        });

        return translatedMonth[0];
    }
    generateDayName = (diagnoseDate) => {
        var diagnoseDay = diagnoseDate.getDay();
        var RussianDays = Russian.weekdays.shorthand;

        let translatedDays = RussianDays.filter((dayName, index) => {
            if (index === diagnoseDay) {
                return dayName;
            }
        });

        return translatedDays[0];
    }
    showSalonOnMap = (salonLNG, salonLAT, event) => {
        var coordinate = {"lat": salonLAT, "lng": salonLNG};
        event.preventDefault();

        if (!this.props.IsDesktop) {
            let isSalonActive = false;
            let isMapActive = true;

            this.props.handleMobile(isSalonActive, isMapActive, coordinate);
        }

        this.props.generateMap(this.props.salonsMapMarkers, coordinate);
        $window.scrollTo($("#MapPanel"), 1000, {"offset": {"top": -110}});

    }
    redirectToSalonPage = (event, salonID, diagnoseId) => {
        event.preventDefault();
        let url = "http://" + window.location.host + "/ru-RU/BrandDaysRu/Salon/" + salonID + "/" + diagnoseId;

        location.href = url;
    }
    render() {
        let orderedDiagnoses = this.props.CorrectlyDiagnosesData.sort((a, b) => {
            a = new Date(a);
            b = new Date(b);
            return a > b ? -1 : a < b ? 1 : 0;
        }).reverse();

        return (

            <ul>
                {
                    orderedDiagnoses.length > 0 ? (
                        orderedDiagnoses.map((date) => {
                            let diagnoseDate = new Date(date);

                            return this.props.SalonsData.map(salon => {
                                let salonLAT = salon.Latitude;
                                let salonLNG = salon.Longitude;
                                let salonID = salon.Id;

                                return salon.Diagnoses.map((diagnose) => {
                                    let newDiagnoseDate = new Date(diagnose.Date);
                                    let diagnoseId = diagnose.DiagnoseId;

                                    if (diagnoseDate.getDate() === newDiagnoseDate.getDate()) {
                                        return <li className="clearfix">
                                            <div className="date">
                                                <b className="day" id={this.generateDateId(diagnoseDate)}>{diagnoseDate.getDate()}</b>
                                                <span className="month">{this.generateMonthName(diagnoseDate)}</span>
                                                <span className="day-name">{this.generateDayName(diagnoseDate)}</span>
                                            </div>
                                            <ul>
                                                <li>
                                                    <h3><a href="#" onClick={(event) => this.redirectToSalonPage(event, salonID, diagnoseId)}>{salon.Name}</a></h3>
                                                    <b><a href="#" onClick={(event) => this.redirectToSalonPage(event, salonID, diagnoseId)}>{salon.City}</a></b>
                                                    <p>{salon.AddressLine1}</p>
                                                    <a href="#" onClick={(event) => this.showSalonOnMap(salonLNG, salonLAT, event)}>показать на карте</a>
                                                </li>
                                            </ul>
                                        </li>;
                                    }
                                });

                            });
                        })
                    ) : (
                        <div className="bdru_loader">
                            Информация о Днях Бренда отсутствует.<br />Попробуйте изменить запрос.
                        </div>
                    )
                }
            </ul>
        );
    }
}
