"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

type Booking = {
  id: number;
  crop: string;
  status: string;
  transporter_name: string;
};

type SOSRequest = {
  id: number;
  emergency_type: string;
  status: string;
};

type NotificationItem = {
  id: string;
  type: "transport" | "sos";
  referenceId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function TransportNotifications() {
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [open, setOpen] =
    useState(false);

  const [popup, setPopup] =
    useState<NotificationItem | null>(null);

  useEffect(() => {
    loadSavedNotifications();

    const loggedIn =
      localStorage.getItem(
        "farmerLoggedIn"
      );

    const farmerPhone =
      localStorage.getItem(
        "farmerPhone"
      );

    const farmerToken =
      localStorage.getItem(
        "farmerToken"
      );

    if (
      loggedIn !== "true" ||
      !farmerPhone ||
      !farmerToken
    ) {
      return;
    }

    checkAllUpdates(
      farmerPhone,
      farmerToken
    );

    const interval =
      setInterval(() => {
        checkAllUpdates(
          farmerPhone,
          farmerToken
        );
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!popup) {
      return;
    }

    const timer =
      setTimeout(() => {
        setPopup(null);
      }, 7000);

    return () => {
      clearTimeout(timer);
    };
  }, [popup]);

  async function checkAllUpdates(
    phone: string,
    token: string
  ) {
    await Promise.all([
      checkTransportBookings(
        phone
      ),
      checkSOSRequests(
        phone,
        token
      ),
    ]);
  }

  function loadSavedNotifications() {
    try {
      const saved =
        localStorage.getItem(
          "farmerNotifications"
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setNotifications(parsed);
      }
    } catch {
      console.log(
        "Could not load notifications."
      );
    }
  }

  function saveNotifications(
    items: NotificationItem[]
  ) {
    localStorage.setItem(
      "farmerNotifications",
      JSON.stringify(items)
    );

    setNotifications(items);
  }

  function addNotification(
    notification: NotificationItem
  ) {
    const saved =
      localStorage.getItem(
        "farmerNotifications"
      );

    let current:
      NotificationItem[] = [];

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          current = parsed;
        }
      } catch {
        current = [];
      }
    }

    const updated = [
      notification,
      ...current,
    ].slice(0, 30);

    saveNotifications(updated);

    // Show automatic popup
    setPopup(notification);
  }

  // ==========================================
  // TRANSPORT
  // ==========================================

  async function checkTransportBookings(
    phone: string
  ) {
    try {
      const response =
        await fetch(
          `http://192.168.0.106:8000/api/transport/bookings/farmer/${encodeURIComponent(
            phone
          )}`,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        return;
      }

      const bookings: Booking[] =
        await response.json();

      bookings.forEach((booking) => {
        checkBookingStatus(booking);
      });
    } catch (error) {
      console.error(
        "Transport notification check failed:",
        error
      );
    }
  }

  function checkBookingStatus(
    booking: Booking
  ) {
    const storageKey =
      `transportBookingStatus_${booking.id}`;

    const previousStatus =
      localStorage.getItem(
        storageKey
      );

    if (!previousStatus) {
      localStorage.setItem(
        storageKey,
        booking.status
      );

      return;
    }

    if (
      previousStatus ===
      booking.status
    ) {
      return;
    }

    localStorage.setItem(
      storageKey,
      booking.status
    );

    const notification: NotificationItem =
      {
        id:
          `transport-${booking.id}-${Date.now()}`,

        type:
          "transport",

        referenceId:
          booking.id,

        title:
          "Transport Update",

        message:
          createTransportNotificationMessage(
            booking
          ),

        read:
          false,

        createdAt:
          new Date().toISOString(),
      };

    addNotification(notification);
  }

  // ==========================================
  // SOS
  // ==========================================

  async function checkSOSRequests(
    phone: string,
    token: string
  ) {
    try {
      const response =
        await fetch(
          `http://192.168.0.106:8000/api/sos/farmer/${encodeURIComponent(
            phone
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );

      if (!response.ok) {
        return;
      }

      const sosRequests: SOSRequest[] =
        await response.json();

      sosRequests.forEach((sos) => {
        checkSOSStatus(sos);
      });
    } catch (error) {
      console.error(
        "SOS notification check failed:",
        error
      );
    }
  }

  function checkSOSStatus(
    sos: SOSRequest
  ) {
    const storageKey =
      `sosStatus_${sos.id}`;

    const previousStatus =
      localStorage.getItem(
        storageKey
      );

    if (!previousStatus) {
      localStorage.setItem(
        storageKey,
        sos.status
      );

      return;
    }

    if (
      previousStatus ===
      sos.status
    ) {
      return;
    }

    localStorage.setItem(
      storageKey,
      sos.status
    );

    const notification: NotificationItem =
      {
        id:
          `sos-${sos.id}-${Date.now()}`,

        type:
          "sos",

        referenceId:
          sos.id,

        title:
          "SOS Update",

        message:
          createSOSNotificationMessage(
            sos
          ),

        read:
          false,

        createdAt:
          new Date().toISOString(),
      };

    addNotification(notification);
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  function markAllAsRead() {
    const updated =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      );

    saveNotifications(updated);
  }

  function markAsRead(
    id: string
  ) {
    const updated =
      notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
      );

    saveNotifications(updated);
  }

  function clearNotifications() {
    saveNotifications([]);
  }

  function openNotification(
    notification: NotificationItem
  ) {
    markAsRead(
      notification.id
    );

    if (
      notification.type ===
      "sos"
    ) {
      router.push(
        "/my-sos"
      );
    } else {
      router.push(
        "/transport-history"
      );
    }

    setOpen(false);
    setPopup(null);
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  if (
    pathname.startsWith(
      "/admin"
    )
  ) {
    return null;
  }

  return (
    <>
      {/* =====================================
          POPUP TOAST
      ===================================== */}

      {popup && (
        <div
          className={`farmerNotificationPopup ${
            popup.type === "sos"
              ? "sosPopup"
              : "transportPopup"
          }`}
        >
          <div className="farmerNotificationPopupIcon">
            {popup.type === "sos"
              ? "🚨"
              : "🚚"}
          </div>

          <div className="farmerNotificationPopupContent">
            <strong>
              {popup.title}
            </strong>

            <p>
              {popup.message}
            </p>

            <button
              type="button"
              onClick={() =>
                openNotification(
                  popup
                )
              }
            >
              View Update
            </button>
          </div>

          <button
            type="button"
            className="farmerNotificationPopupClose"
            onClick={() =>
              setPopup(null)
            }
          >
            ×
          </button>
        </div>
      )}


      {/* =====================================
          BELL
      ===================================== */}

      <div className="farmerNotificationCenter">

        <button
          type="button"
          className="farmerNotificationBell"
          onClick={() =>
            setOpen(!open)
          }
        >
          🔔

          {unreadCount > 0 && (
            <span className="farmerNotificationCount">
              {unreadCount}
            </span>
          )}
        </button>


        {open && (
          <div className="farmerNotificationPanel">

            <div className="farmerNotificationHeader">

              <div>
                <h3>
                  Notifications
                </h3>

                <span>
                  {unreadCount} unread
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="notificationPanelClose"
              >
                ×
              </button>

            </div>


            {notifications.length > 0 && (
              <div className="notificationPanelActions">

                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                >
                  Mark all read
                </button>

                <button
                  type="button"
                  onClick={
                    clearNotifications
                  }
                >
                  Clear all
                </button>

              </div>
            )}


            <div className="notificationList">

              {notifications.length === 0 && (
                <div className="notificationEmpty">

                  <div>
                    🔔
                  </div>

                  <p>
                    No notifications yet.
                  </p>

                </div>
              )}


              {notifications.map(
                (notification) => (

                  <button
                    type="button"
                    key={
                      notification.id
                    }
                    className={
                      notification.read
                        ? "notificationItem"
                        : "notificationItem unread"
                    }
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                  >

                    <div className="notificationItemIcon">
                      {notification.type ===
                      "sos"
                        ? "🚨"
                        : "🚚"}
                    </div>

                    <div className="notificationItemContent">

                      <strong>
                        {
                          notification.title
                        }
                      </strong>

                      <p>
                        {
                          notification.message
                        }
                      </p>

                      <small>
                        {
                          formatNotificationTime(
                            notification.createdAt
                          )
                        }
                      </small>

                    </div>

                    {!notification.read && (
                      <span className="notificationUnreadDot" />
                    )}

                  </button>

                )
              )}

            </div>

          </div>
        )}

      </div>
    </>
  );
}


// ==========================================
// TRANSPORT MESSAGE
// ==========================================

function createTransportNotificationMessage(
  booking: Booking
) {
  if (
    booking.status ===
    "Confirmed"
  ) {
    return (
      `Your ${booking.crop} transport booking #${booking.id} ` +
      `has been confirmed by ${booking.transporter_name}.`
    );
  }

  if (
    booking.status ===
    "In Transit"
  ) {
    return (
      `Your ${booking.crop} transport booking #${booking.id} ` +
      "is now in transit."
    );
  }

  if (
    booking.status ===
    "Completed"
  ) {
    return (
      `Your ${booking.crop} transport booking #${booking.id} ` +
      "has been completed."
    );
  }

  if (
    booking.status ===
    "Cancelled"
  ) {
    return (
      `Your ${booking.crop} transport booking #${booking.id} ` +
      "has been cancelled."
    );
  }

  return (
    `Transport booking #${booking.id} ` +
    `status changed to ${booking.status}.`
  );
}


// ==========================================
// SOS MESSAGE
// ==========================================

function createSOSNotificationMessage(
  sos: SOSRequest
) {
  if (
    sos.status ===
    "Received"
  ) {
    return (
      `Emergency request #${sos.id} for ${sos.emergency_type} ` +
      "has been received."
    );
  }

  if (
    sos.status ===
    "Responding"
  ) {
    return (
      `Emergency request #${sos.id} for ${sos.emergency_type} ` +
      "is now being responded to."
    );
  }

  if (
    sos.status ===
    "Help Dispatched"
  ) {
    return (
      `Help has been dispatched for emergency request #${sos.id} ` +
      `for ${sos.emergency_type}.`
    );
  }

  if (
    sos.status ===
    "Resolved"
  ) {
    return (
      `Emergency request #${sos.id} for ${sos.emergency_type} ` +
      "has been marked as resolved."
    );
  }

  return (
    `Emergency request #${sos.id} ` +
    `status changed to ${sos.status}.`
  );
}


// ==========================================
// TIME
// ==========================================

function formatNotificationTime(
  value: string
) {
  const date =
    new Date(value);

  return date.toLocaleString();
}