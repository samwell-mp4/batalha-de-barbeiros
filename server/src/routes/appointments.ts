import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppointmentStatus } from '@prisma/client';

const router = Router();

// Haversine formula to calculate distance in km between two points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Create a new appointment (Standard, Express or Queue)
router.post('/', async (req, res) => {
  try {
    const {
      clientId,
      barberId,
      date,
      time,
      services,
      price,
      paymentMethod,
      isExpress,
      isQueue,
      latitude,
      longitude,
    } = req.body;

    console.log('[API] Creating Appointment:', { clientId, barberId, isExpress, isQueue });

    if (!clientId) {
      return res.status(400).json({ error: 'Missing clientId' });
    }
    if (!isExpress && !isQueue && !barberId) {
      return res.status(400).json({ error: 'Missing barberId for standard appointments' });
    }

    // Parse date correctly: if it's a number (like 16), represent it as May 16, 2026 in UTC
    let parsedDate = new Date();
    if (typeof date === 'number') {
      parsedDate = new Date(Date.UTC(2026, 4, date)); // May 2026 UTC
    } else if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        parsedDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        barberId: barberId || null,
        date: parsedDate,
        time: time || 'EXPRESS',
        services: services || [],
        price: parseFloat(price || 0),
        paymentMethod,
        isExpress: !!isExpress,
        isQueue: !!isQueue,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: 'PENDING',
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(appointment);
  } catch (error: any) {
    console.error('[API ERROR] Failed to create appointment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all active Express/Queue requests within 5km of a barber's location
router.get('/active-requests', async (req, res) => {
  try {
    const { latitude, longitude, barberId } = req.query;

    console.log('[API] Fetching active express/queue requests. Barber coords:', { latitude, longitude });

    // Fetch all pending express or queue requests
    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { isExpress: true },
          { isQueue: true },
        ],
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If barber coordinates are passed, filter by 5km radius
    if (latitude && longitude) {
      const bLat = parseFloat(latitude as string);
      const bLng = parseFloat(longitude as string);

      const filtered = appointments.filter((appointment) => {
        // If appointment doesn't have coordinates, keep it as default or filter
        if (appointment.latitude === null || appointment.longitude === null) {
          return true;
        }

        const distance = getDistance(
          bLat,
          bLng,
          appointment.latitude,
          appointment.longitude
        );

        // Keep within 5km
        return distance <= 5.0;
      });

      return res.json(filtered);
    }

    res.json(appointments);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch active requests:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get client's appointments
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      include: {
        barber: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch client appointments:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get barber's appointments
router.get('/barber/:barberId', async (req, res) => {
  try {
    const { barberId } = req.params;

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { barberId },
          {
            barber: {
              userId: barberId,
            },
          },
        ],
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch barber appointments:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single appointment details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch appointment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status and assign barber (for open requests)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, barberId, price } = req.body;

    console.log('[API] Updating appointment status:', { id, status, barberId, price });

    // Build update data
    const updateData: any = { status };

    if (price !== undefined) {
      updateData.price = parseFloat(price as string);
    }

    if (req.body.date !== undefined) {
      updateData.date = new Date(req.body.date);
    }

    if (req.body.time !== undefined) {
      updateData.time = req.body.time;
    }

    if (barberId) {
      // Find the barber's actual ID if the user ID was provided
      const barber = await prisma.barber.findFirst({
        where: {
          OR: [
            { id: barberId },
            { userId: barberId }
          ]
        }
      });
      if (barber) {
        updateData.barberId = barber.id;
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        barber: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(appointment);
  } catch (error: any) {
    console.error('[API ERROR] Failed to update appointment status:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get active non-completed/non-cancelled appointment for a user
router.get('/user-active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find if the user is a barber
    const barber = await prisma.barber.findFirst({
      where: { userId }
    });

    const activeAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { clientId: userId },
          ...(barber ? [{ barberId: barber.id }] : [])
        ],
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      },
      include: {
        client: true,
        barber: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(activeAppointment || null);
  } catch (error: any) {
    console.error('[API ERROR] Failed to fetch active appointment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a single appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('[API ERROR] Failed to delete appointment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Bulk clear completed/cancelled appointments for a user/barber
router.delete('/clear-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find if the user is a barber
    const barber = await prisma.barber.findFirst({
      where: { userId }
    });

    const deleteResult = await prisma.appointment.deleteMany({
      where: {
        OR: [
          {
            clientId: userId,
            status: { in: ['COMPLETED', 'CANCELLED'] as AppointmentStatus[] }
          },
          ...(barber ? [{
            barberId: barber.id,
            status: { in: ['COMPLETED', 'CANCELLED'] as AppointmentStatus[] }
          }] : [])
        ]
      }
    });

    res.json({ success: true, count: deleteResult.count });
  } catch (error: any) {
    console.error('[API ERROR] Failed to clear history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
