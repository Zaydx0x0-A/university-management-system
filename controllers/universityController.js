const universityService = require('../services/universityService');

class UniversityController {
  async getAllUniversities(req, res) {
    try {
      const universities = await universityService.getAllUniversities();
      res.json(universities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUniversityById(req, res) {
    try {
      const university = await universityService.getUniversityById(req.params.id);
      if (!university) {
        return res.status(404).json({ error: 'University not found' });
      }
      res.json(university);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createUniversity(req, res) {
    try {
      const university = await universityService.createUniversity(req.body);
      res.status(201).json(university);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUniversity(req, res) {
    try {
      const university = await universityService.updateUniversity(req.params.id, req.body);
      res.json(university);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUniversity(req, res) {
    try {
      await universityService.deleteUniversity(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUniversityStats(req, res) {
    try {
      const stats = await universityService.getUniversityStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UniversityController();