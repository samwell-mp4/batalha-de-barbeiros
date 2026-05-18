import { Router } from 'express';
import { prisma } from '../lib/prisma';

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

    if (!clientId || !barberId) {
      return res.status(400).json({ error: 'Missing clientId or barberId' });
    }

    // Parse date correctly: if it's a number (like 16), represent it as May 16, 2026
    let parsedDate = new Date();
    if (typeof date === 'number') {
      parsedDate = new Date(2026, 4, date); // May 2026
    } else if (date) {
      parsedDate = new Date(date);
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        barberId,
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

// Update appointment status and assign barber (for open requests)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, barberId } = req.body;

    console.log('[API] Updating appointment status:', { id, status, barberId });

    // Build update data
    const updateData: any = { status };

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

export default router;
